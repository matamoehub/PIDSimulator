"""Admin / ops endpoints: deploy, test, status, and robot/course uploads.

nginx restricts /api/admin/* to trusted IPs and HTTP Basic Auth in production
(see deploy/nginx.conf), but that's a proxy-layer control — a missing or
misconfigured nginx rule would otherwise expose these unauthenticated. The
deploy/test/restart routes run `git pull`, `pip install`, `npm ci`/`build`,
and a service reload, so they get an app-level shared-secret gate as well
(defense in depth): callers must send a `X-Admin-Token` header matching
PIDSIM_ADMIN_TOKEN. If that env var isn't set, the gated routes return 503
rather than silently allowing (or hard-coding) a default token.
"""
import logging
import secrets

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile

from app import settings
from app.services import deploy, storage

log = logging.getLogger("pidsim")
router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin_token(x_admin_token: str | None = Header(default=None)) -> None:
    """Shared-secret gate for deploy/test/restart. Raises on missing config or bad token."""
    if not settings.ADMIN_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="Admin actions are disabled: PIDSIM_ADMIN_TOKEN is not configured",
        )
    if not x_admin_token or not secrets.compare_digest(x_admin_token, settings.ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid or missing X-Admin-Token")


@router.get("/status")
def status():
    return deploy.git_status()


@router.post("/deploy", dependencies=[Depends(require_admin_token)])
def run_deploy():
    log.info("deploy: started")
    results, success = deploy.run_update()
    log.info("deploy: finished success=%s steps=%d", success, len(results))
    return {"action": "deploy", "success": success, "results": results}


@router.post("/test", dependencies=[Depends(require_admin_token)])
def run_test():
    log.info("test: started")
    results = deploy.run_tests()
    success = all(r["rc"] == 0 for r in results)
    log.info("test: finished success=%s", success)
    return {"action": "test", "success": success, "results": results}


@router.post("/restart", dependencies=[Depends(require_admin_token)])
def restart():
    res = deploy.reload_service()
    log.info("restart: success=%s", res["rc"] == 0)
    return {"action": "restart", "success": res["rc"] == 0, "results": [res]}


@router.get("/robots")
def get_robots():
    return storage.list_robots()


@router.post("/robots")
async def upload_robot(file: UploadFile = File(...)):
    raw = await file.read()
    try:
        robot = storage.save_robot(raw)
    except storage.ValidationError as e:
        log.warning("robot upload rejected: %s", e)
        raise HTTPException(status_code=422, detail=str(e))
    log.info("robot uploaded: %s", robot["id"])
    return {"saved": robot}


@router.get("/courses")
def get_courses():
    return storage.list_courses()


@router.post("/courses")
async def upload_course(file: UploadFile = File(...)):
    raw = await file.read()
    try:
        meta = storage.save_course(file.filename or "course", raw)
    except storage.ValidationError as e:
        log.warning("course upload rejected (%s): %s", file.filename, e)
        raise HTTPException(status_code=422, detail=str(e))
    log.info("course uploaded: %s (%s)", meta["name"], meta["format"])
    return {"saved": meta}
