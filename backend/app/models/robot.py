"""Robot platform config schema — matches the spec's Platform Config Structure.

Used to validate admin-uploaded robot definitions before they're stored.
"""
import re

from pydantic import BaseModel, Field, field_validator

ID_RE = re.compile(r"^[a-z0-9_]+$")


class RobotPlatform(BaseModel):
    id: str = Field(..., description="lowercase slug, e.g. esp32_qtr8")
    name: str
    sensor_count_options: list[int] = Field(..., min_length=1)
    sensor_spacing_mm: float = Field(..., gt=0)
    motor_max_rpm: int = Field(..., gt=0)
    motor_speed_range: tuple[int, int]
    default_base_speed: int = Field(..., ge=0)
    sensor_response_time_ms: float = Field(..., gt=0)
    loop_time_ms: float = Field(..., gt=0)
    code_target: str
    icon: str | None = None  # top-down icon key (see frontend RobotIcon)

    @field_validator("id")
    @classmethod
    def _slug(cls, v: str) -> str:
        if not ID_RE.match(v):
            raise ValueError("id must be lowercase letters, digits, or underscores")
        return v

    @field_validator("sensor_count_options")
    @classmethod
    def _sensors_positive(cls, v: list[int]) -> list[int]:
        if any(n < 1 or n > 32 for n in v):
            raise ValueError("sensor counts must be between 1 and 32")
        return v

    @field_validator("motor_speed_range")
    @classmethod
    def _range_ordered(cls, v: tuple[int, int]) -> tuple[int, int]:
        lo, hi = v
        if lo >= hi:
            raise ValueError("motor_speed_range must be [low, high] with low < high")
        return v
