import json

from fastapi.testclient import TestClient

from app.main import app
from tests.test_storage import VALID_ROBOT

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_upload_robot_then_list():
    r = client.post(
        "/api/admin/robots",
        files={"file": ("robot.json", json.dumps(VALID_ROBOT), "application/json")},
    )
    assert r.status_code == 200
    assert r.json()["saved"]["id"] == "esp32_qtr8"

    listed = client.get("/api/admin/robots").json()
    assert any(rb["id"] == "esp32_qtr8" for rb in listed)


def test_upload_bad_robot_returns_422():
    r = client.post(
        "/api/admin/robots",
        files={"file": ("robot.json", "{not json", "application/json")},
    )
    assert r.status_code == 422


def test_upload_course_svg():
    svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L10 10"/></svg>'
    r = client.post(
        "/api/admin/courses",
        files={"file": ("oval.svg", svg, "image/svg+xml")},
    )
    assert r.status_code == 200
    assert r.json()["saved"]["format"] == "svg"
