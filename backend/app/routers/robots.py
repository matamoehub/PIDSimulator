"""Public robot platform library endpoint (spec: GET /api/robots)."""
from fastapi import APIRouter

from app.services import library

router = APIRouter(tags=["robots"])


@router.get("/robots")
def get_robots():
    return library.list_platforms()
