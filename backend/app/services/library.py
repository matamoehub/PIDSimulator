"""Robot platform library: the built-in catalogue (shipped in app/data/robots)
overlaid with any admin-uploaded platforms (stored under DATA_DIR/robots). An
uploaded platform with the same id overrides the built-in one.
"""
from pathlib import Path

from app.models.robot import RobotPlatform
from app.services import storage

BUILTIN_DIR = Path(__file__).resolve().parent.parent / "data" / "robots"


def list_platforms() -> list[dict]:
    by_id: dict[str, dict] = {}
    for p in sorted(BUILTIN_DIR.glob("*.json")):
        try:
            robot = RobotPlatform.model_validate_json(p.read_text())
        except Exception:  # noqa: BLE001 — skip malformed built-ins
            continue
        by_id[robot.id] = {**robot.model_dump(), "builtin": True}

    for robot in storage.list_robots():  # uploaded ones override built-ins
        by_id[robot["id"]] = {**robot, "builtin": False}

    return list(by_id.values())
