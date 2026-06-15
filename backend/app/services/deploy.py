"""Deploy / test orchestration for the admin page.

Mirrors the MatamoeBookings admin deploy flow: each step is a subprocess whose
return code + output is captured and returned, stopping at the first failure.
After a successful update the gunicorn master is reloaded via SIGHUP so the new
workers spawn before the old ones retire — the HTTP request that triggered the
deploy completes normally, and no sudo is needed (web + gunicorn share a user).
"""
import os
import signal
import subprocess
import sys
import time

from app.settings import REPO_ROOT

BACKEND_DIR = REPO_ROOT / "backend"
FRONTEND_DIR = REPO_ROOT / "frontend"
SERVICE = "pidsim-api.service"


def _run(label: str, cmd: list[str], cwd, timeout: int = 600) -> dict:
    """Run a subprocess; never raises. Returns a result dict for the UI."""
    try:
        r = subprocess.run(
            cmd, capture_output=True, text=True, cwd=str(cwd), timeout=timeout
        )
        return {
            "label": label,
            "cmd": " ".join(cmd),
            "rc": r.returncode,
            "stdout": r.stdout.strip(),
            "stderr": r.stderr.strip(),
        }
    except subprocess.TimeoutExpired:
        return {"label": label, "cmd": " ".join(cmd), "rc": -1,
                "stdout": "", "stderr": f"Timed out after {timeout}s"}
    except Exception as e:  # noqa: BLE001 — surface anything to the UI
        return {"label": label, "cmd": " ".join(cmd), "rc": -1,
                "stdout": "", "stderr": str(e)}


def _git(args: list[str]) -> str:
    try:
        return subprocess.run(
            ["git", *args], capture_output=True, text=True, cwd=str(REPO_ROOT)
        ).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def reload_service() -> dict:
    """Graceful SIGHUP reload of the gunicorn master. Returns a result dict."""
    r = subprocess.run(
        ["systemctl", "show", SERVICE, "-p", "MainPID", "--value"],
        capture_output=True, text=True,
    )
    label, cmd = "Reload service", f"kill -HUP $(systemctl show {SERVICE} -p MainPID --value)"
    try:
        pid = int(r.stdout.strip())
        if pid <= 0:
            raise ValueError
    except ValueError:
        return {"label": label, "cmd": cmd, "rc": 1, "stdout": "",
                "stderr": f"could not read {SERVICE} PID (not running under systemd?)"}
    try:
        os.kill(pid, signal.SIGHUP)
    except (ProcessLookupError, PermissionError) as e:
        return {"label": label, "cmd": cmd, "rc": 1, "stdout": "", "stderr": str(e)}
    time.sleep(3)
    status = subprocess.run(
        ["systemctl", "is-active", SERVICE], capture_output=True, text=True
    )
    if status.stdout.strip() == "active":
        return {"label": label, "cmd": cmd, "rc": 0,
                "stdout": f"{SERVICE} reloaded (PID {pid}) and is active", "stderr": ""}
    return {"label": label, "cmd": cmd, "rc": 1, "stdout": "",
            "stderr": f"{SERVICE} may not have reloaded — check journalctl -u {SERVICE}"}


def _test_steps() -> list[tuple[str, list[str], object]]:
    return [
        ("Backend tests (pytest)", [sys.executable, "-m", "pytest", "-q"], BACKEND_DIR),
        ("Frontend tests (vitest)", ["npm", "run", "test"], FRONTEND_DIR),
    ]


def run_tests() -> list[dict]:
    """Pull latest, then run backend + frontend test suites."""
    branch = _git(["rev-parse", "--abbrev-ref", "HEAD"]) or "main"
    results = [_run("Pull latest code", ["git", "pull", "origin", branch], REPO_ROOT)]
    if results[-1]["rc"] != 0:
        return results
    for label, cmd, cwd in _test_steps():
        results.append(_run(label, cmd, cwd))
    return results


def run_update() -> tuple[list[dict], bool]:
    """Full deploy: pull, install, build frontend, run tests, reload.

    Stops at the first failing step. Tests gate the reload — if they fail the
    running service is left untouched (mirrors the bookings update script).
    Returns (results, success).
    """
    branch = _git(["rev-parse", "--abbrev-ref", "HEAD"]) or "main"
    steps: list[tuple[str, list[str], object]] = [
        ("Fetch from remote", ["git", "fetch", "origin"], REPO_ROOT),
        ("Pull latest code", ["git", "pull", "origin", branch], REPO_ROOT),
        ("Install backend deps", [sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"], BACKEND_DIR),
        ("Install frontend deps", ["npm", "ci"], FRONTEND_DIR),
        ("Build frontend", ["npm", "run", "build"], FRONTEND_DIR),
        *_test_steps(),
    ]
    results: list[dict] = []
    for label, cmd, cwd in steps:
        res = _run(label, cmd, cwd)
        results.append(res)
        if res["rc"] != 0:
            return results, False

    results.append(reload_service())
    return results, results[-1]["rc"] == 0


def git_status() -> dict:
    _git(["fetch", "origin", "--quiet"])
    branch = _git(["rev-parse", "--abbrev-ref", "HEAD"])
    return {
        "branch": branch,
        "log": _git(["log", "--oneline", "-8"]),
        "status": _git(["status", "--short"]),
        "remote": _git(["remote", "get-url", "origin"]),
        "ahead_behind": _git(
            ["rev-list", "--left-right", "--count", f"{branch}...origin/{branch}"]
        ),
    }
