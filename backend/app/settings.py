"""Runtime settings.

Uploaded courses and robot configs are written to a data directory that lives
*outside* the git working tree's tracked content (it's .gitignored) so a deploy
`git pull` never conflicts with user uploads. In production systemd sets
PIDSIM_DATA_DIR=/opt/robot/pidsim/data; locally it defaults to <repo>/data.
"""
import os
from pathlib import Path

# backend/app/settings.py -> repo root is three parents up.
REPO_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = Path(os.environ.get("PIDSIM_DATA_DIR", REPO_ROOT / "data"))
TRACKS_DIR = DATA_DIR / "tracks"
ROBOTS_DIR = DATA_DIR / "robots"


def ensure_data_dirs() -> None:
    TRACKS_DIR.mkdir(parents=True, exist_ok=True)
    ROBOTS_DIR.mkdir(parents=True, exist_ok=True)
