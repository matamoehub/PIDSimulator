"""Line Follower PID Simulator — backend API.

Phase 1 keeps the backend stateless: the real-time physics/PID loop runs in the
browser. This service owns the platform library, track definitions, calibration
helpers, and (Phase 3) code generation. See README for the deployment model.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health

app = FastAPI(
    title="Line Follower PID Simulator API",
    version="0.1.0",
    description="Stateless config/codegen API for the PID simulator (Phase 1).",
)

# In dev the Vite server (5173) calls the API directly. In production nginx
# serves the SPA and reverse-proxies /api to this service on the same origin,
# so CORS is only needed for local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")


@app.get("/api")
def root():
    return {"service": "lfr-pid-simulator", "version": app.version}
