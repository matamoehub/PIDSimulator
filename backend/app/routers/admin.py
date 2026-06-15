"""Admin / ops endpoints: deploy, test, status, and robot/course uploads.

NOTE: these are unauthenticated by request. nginx should restrict /api/admin/*
to trusted IPs (or add auth) before the host is exposed beyond the LAN.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services import deploy, storage

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/status")
def status():
    return deploy.git_status()


@router.post("/deploy")
def run_deploy():
    results, success = deploy.run_update()
    return {"action": "deploy", "success": success, "results": results}


@router.post("/test")
def run_test():
    results = deploy.run_tests()
    return {
        "action": "test",
        "success": all(r["rc"] == 0 for r in results),
        "results": results,
    }


@router.post("/restart")
def restart():
    res = deploy.reload_service()
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
        raise HTTPException(status_code=422, detail=str(e))
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
        raise HTTPException(status_code=422, detail=str(e))
    return {"saved": meta}
