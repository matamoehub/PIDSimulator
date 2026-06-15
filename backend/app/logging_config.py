"""Application file logging.

Writes app + admin-action logs to LOG_DIR/app.log with rotation. This is
separate from gunicorn's access/error logs (configured in the systemd unit),
which also land in the same logs/ directory.
"""
import logging
from logging.handlers import RotatingFileHandler

from app.settings import LOG_DIR, ensure_log_dir

logger = logging.getLogger("pidsim")


def configure_logging() -> None:
    ensure_log_dir()
    if logger.handlers:  # avoid duplicate handlers across gunicorn workers/reload
        return
    handler = RotatingFileHandler(
        LOG_DIR / "app.log", maxBytes=5_000_000, backupCount=5
    )
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
