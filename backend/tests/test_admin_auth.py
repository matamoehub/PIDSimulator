"""Auth gate on the deploy/test/restart admin routes.

These run git pull / pip install / npm ci+build / a service reload, so they
require an X-Admin-Token header matching app.settings.ADMIN_TOKEN in addition
to whatever nginx does in front of them. See backend/app/routers/admin.py.
"""
from fastapi.testclient import TestClient

from app import settings
from app.main import app
from app.services import deploy

client = TestClient(app)

GATED_ROUTES = ["/api/admin/deploy", "/api/admin/test", "/api/admin/restart"]


def test_gated_routes_return_503_when_token_not_configured(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_TOKEN", None)
    for path in GATED_ROUTES:
        r = client.post(path, headers={"X-Admin-Token": "anything"})
        assert r.status_code == 503, path


def test_gated_routes_reject_missing_or_wrong_token(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_TOKEN", "correct-horse-battery-staple")
    for path in GATED_ROUTES:
        r = client.post(path)
        assert r.status_code == 401, f"{path} (no header)"

        r = client.post(path, headers={"X-Admin-Token": "wrong"})
        assert r.status_code == 401, f"{path} (wrong header)"


def test_gated_routes_accept_correct_token(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_TOKEN", "correct-horse-battery-staple")
    # Stub out the actual subprocess-running work — this test only exercises
    # the auth gate, not deploy/test/restart behaviour (covered elsewhere).
    monkeypatch.setattr(deploy, "run_update", lambda: ([], True))
    monkeypatch.setattr(deploy, "run_tests", lambda: [])
    monkeypatch.setattr(
        deploy, "reload_service",
        lambda: {"label": "Reload service", "cmd": "", "rc": 0, "stdout": "ok", "stderr": ""},
    )

    headers = {"X-Admin-Token": "correct-horse-battery-staple"}
    assert client.post("/api/admin/deploy", headers=headers).status_code == 200
    assert client.post("/api/admin/test", headers=headers).status_code == 200
    assert client.post("/api/admin/restart", headers=headers).status_code == 200


def test_status_route_stays_unauthenticated():
    # /status is read-only (git log/branch/remote) and was never in scope for
    # this gate — only deploy/test/restart perform mutating actions.
    r = client.get("/api/admin/status")
    assert r.status_code == 200
