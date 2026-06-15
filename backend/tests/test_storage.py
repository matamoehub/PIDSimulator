import json

import pytest

from app.services import storage

VALID_ROBOT = {
    "id": "esp32_qtr8",
    "name": "ESP32 with QTR-8RC (8 sensors)",
    "sensor_count_options": [8],
    "sensor_spacing_mm": 10.16,
    "motor_max_rpm": 300,
    "motor_speed_range": [0, 255],
    "default_base_speed": 150,
    "sensor_response_time_ms": 2.5,
    "loop_time_ms": 10,
    "code_target": "arduino",
}


def test_save_valid_robot_roundtrips():
    saved = storage.save_robot(json.dumps(VALID_ROBOT).encode())
    assert saved["id"] == "esp32_qtr8"
    assert VALID_ROBOT["id"] in {r["id"] for r in storage.list_robots()}


def test_save_robot_rejects_bad_slug():
    bad = {**VALID_ROBOT, "id": "ESP 32!"}
    with pytest.raises(storage.ValidationError):
        storage.save_robot(json.dumps(bad).encode())


def test_save_robot_rejects_non_json():
    with pytest.raises(storage.ValidationError):
        storage.save_robot(b"not json")


def test_save_svg_course_strips_script():
    svg = (
        b'<svg xmlns="http://www.w3.org/2000/svg">'
        b'<rect onclick="evil()" x="0"/></svg>'
    )
    meta = storage.save_course("track_circle.svg", svg)
    assert meta["format"] == "svg"
    text = open(meta["path"]).read()
    assert "onclick" not in text


def test_save_svg_course_rejects_script_element():
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>x</script></svg>'
    with pytest.raises(storage.ValidationError):
        storage.save_course("evil.svg", svg)


def test_save_course_rejects_unknown_extension():
    with pytest.raises(storage.ValidationError):
        storage.save_course("track.png", b"\x89PNG")
