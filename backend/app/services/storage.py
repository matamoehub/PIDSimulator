"""Persistence for admin-uploaded robots and courses (tracks).

Files are written under settings.DATA_DIR (outside the tracked git content), so
uploads survive a deploy `git pull`. Filenames are slugged to keep them inside
the target directory (no path traversal).
"""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from app.models.robot import RobotPlatform
from app.settings import ROBOTS_DIR, TRACKS_DIR, ensure_data_dirs

SLUG_RE = re.compile(r"[^a-z0-9_-]+")

# SVG attributes/elements that can execute script or fetch remote content.
_DANGEROUS_TAGS = {"script", "foreignObject", "iframe", "use"}
_EVENT_ATTR_RE = re.compile(r"^on", re.IGNORECASE)
_URI_ATTR_RE = re.compile(r"(javascript|data):", re.IGNORECASE)


class ValidationError(ValueError):
    """Raised when an upload fails validation/sanitisation."""


def _slug(name: str) -> str:
    stem = Path(name).stem.lower().replace(" ", "_")
    stem = SLUG_RE.sub("", stem)
    if not stem:
        raise ValidationError("filename has no usable characters")
    return stem


# --- Robots ---------------------------------------------------------------

def save_robot(raw: bytes) -> dict:
    """Validate an uploaded robot config (JSON) and store it. Returns its dict."""
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValidationError(f"not valid JSON: {e}") from e
    try:
        robot = RobotPlatform.model_validate(data)
    except Exception as e:  # pydantic ValidationError -> readable message
        raise ValidationError(f"robot config invalid: {e}") from e

    ensure_data_dirs()
    path = ROBOTS_DIR / f"{robot.id}.json"
    path.write_text(json.dumps(robot.model_dump(), indent=2))
    return robot.model_dump()


def list_robots() -> list[dict]:
    if not ROBOTS_DIR.exists():
        return []
    out = []
    for p in sorted(ROBOTS_DIR.glob("*.json")):
        try:
            out.append(json.loads(p.read_text()))
        except json.JSONDecodeError:
            continue
    return out


# --- Courses (tracks) -----------------------------------------------------

def _sanitise_svg(raw: bytes) -> str:
    """Parse SVG and reject/strip script vectors. Returns cleaned SVG text.

    Rejects loudly on a non-SVG root or dangerous elements; strips event-handler
    and javascript:/data: URI attributes defensively.
    """
    try:
        # resolve_entities is off by default in ElementTree, mitigating XXE.
        root = ET.fromstring(raw)
    except ET.ParseError as e:
        raise ValidationError(f"not well-formed XML/SVG: {e}") from e

    tag = root.tag.split("}")[-1]  # strip namespace
    if tag != "svg":
        raise ValidationError(f"root element is <{tag}>, expected <svg>")

    for el in root.iter():
        local = el.tag.split("}")[-1]
        if local in _DANGEROUS_TAGS:
            raise ValidationError(f"disallowed element <{local}> in SVG")
        for attr in list(el.attrib):
            val = el.attrib[attr]
            if _EVENT_ATTR_RE.match(attr) or _URI_ATTR_RE.search(val):
                del el.attrib[attr]
    return ET.tostring(root, encoding="unicode")


def save_course(filename: str, raw: bytes) -> dict:
    """Store an uploaded course as either track JSON or sanitised SVG.

    Returns metadata: {name, format, path}.
    """
    ensure_data_dirs()
    slug = _slug(filename)
    suffix = Path(filename).suffix.lower()

    if suffix == ".json":
        try:
            json.loads(raw)  # must be valid JSON; geometry schema TBD
        except json.JSONDecodeError as e:
            raise ValidationError(f"not valid JSON: {e}") from e
        path = TRACKS_DIR / f"{slug}.json"
        path.write_bytes(raw)
        fmt = "json"
    elif suffix == ".svg":
        cleaned = _sanitise_svg(raw)
        path = TRACKS_DIR / f"{slug}.svg"
        path.write_text(cleaned)
        fmt = "svg"
    else:
        raise ValidationError("course must be a .json or .svg file")

    return {"name": slug, "format": fmt, "path": str(path)}


def list_courses() -> list[dict]:
    if not TRACKS_DIR.exists():
        return []
    return [
        {"name": p.stem, "format": p.suffix.lstrip("."), "path": str(p)}
        for p in sorted(TRACKS_DIR.iterdir())
        if p.suffix.lower() in (".json", ".svg")
    ]
