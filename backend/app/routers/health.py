"""Health check — used to verify the API is reachable through nginx."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}
