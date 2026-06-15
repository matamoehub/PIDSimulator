"""Admin / ops endpoints: deploy, test, status, and robot/course uploads.

NOTE: these are unauthenticated by request. nginx should restrict /api/admin/*
to trusted IPs (or add auth) before the host is exposed beyond the LAN.
"""
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services import deploy, storage

log = logging.getLogger("pidsim")
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/status")
def status():
    return deploy.git_status()


@router.post("/deploy")
def run_deploy():
    log.info("deploy: started")
    results, success = deploy.run_update()
    log.info("deploy: finished success=%s steps=%d", success, len(results))
    return {"action": "deploy", "success": success, "results": results}


@router.post("/test")
def run_test():
    log.info("test: started")
    results = deploy.run_tests()
    success = all(r["rc"] == 0 for r in results)
    log.info("test: finished success=%s", success)
    return {"action": "test", "success": success, "results": results}


@router.post("/restart")
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
