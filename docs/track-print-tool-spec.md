# Track Layout & Print Production Tool Spec

## Overview
A companion tool to the Line Follower PID Simulator. Takes track geometry exported from the simulator (as SVG or vector format) and transforms it into a print-ready PDF with sponsor branding, custom text, and sizing for physical courses. Ensures crisp lines and sharp logo reproduction suitable for professional printing.
Not part of the simulator itself — a separate downstream tool in the Matamoe robotics suite.

---

## Purpose
Fast line follower robot competitions need physical tracks. Currently, designing and printing these is manual and error-prone. This tool:
- Accepts track geometry from the simulator (or custom imports)
- Places sponsor logos and text at specified locations
- Exports high-resolution vector PDF for print shops
- Handles multi-page layouts for large courses
- Maintains line crispness and logo fidelity at any scale

---

## Architecture

### Input
- Track geometry as SVG (exported from simulator) or imported vector file
- Sponsor logo images (SVG preferred, high-res PNG acceptable)
- Text overlays (sponsor names, event details, QR codes)
- Print specifications (page size, scale, bleed margins)

### Processing
- Vector rendering engine (no rasterisation — all lines and logos remain crisp)
- Layout engine for placing sponsors and text
- Multi-page tiling for large courses
- PDF generation with print-ready settings

### Output
- Single or multi-page vector PDF
- All lines crisp, all logos sharp at any print size
- Ready to send directly to print shop

---

## User Workflow
1. **Import track** — select a track exported from simulator, or upload custom SVG
2. **Preview** — see track on canvas at actual print scale
3. **Add sponsors** — drag and drop logo images onto track canvas, position freely
4. **Add text** — place sponsor names, event title, date, location
5. **Set print specs** — page size, scale factor, margins, bleed
6. **Review** — preview final layout
7. **Export** — download print-ready PDF

---

## Key Features

### Track Import
- Accept SVG files from PID simulator export
- Support custom SVG uploads
- Display at actual print scale with grid overlay
- Zoom and pan

### Sponsor Placement
- Drag-and-drop logos (SVG preferred, PNG accepted)
- Rotation and scale controls per logo
- Alignment guides (grid snap, edge snap)
- Layering (logo behind or in front of track line)
- Undo/redo

### Text Overlays
- Font selection (sans-serif preferred for print clarity)
- Colour picker
- Size and positioning controls
- Optional: text along curved path for track curves

### Print Specifications
- Page size presets: A4, A3, A2, A1, custom
- Scale factor (1:1 actual size, 1:2 half size, etc.)
- Bleed margin (typically 5mm for professional printing)
- Crop marks and registration marks (optional)
- Tiling across multiple pages for large courses

### Export
- Vector PDF — no rasterisation, crisp at any size
- Multi-page auto-tiling if course exceeds single page
- Filename format: `track_[name]_[scale]_[date].pdf`
- Download directly from browser

---

## Technical Stack

### Frontend
- **Canvas library:** Fabric.js (handles vector manipulation, drag-and-drop)
- **PDF generation:** PDFKit.js (vector-based PDF output)
- **SVG parsing:** Native DOM SVG parsing

### Backend (Python)
- **PDF library:** reportlab (vector PDF generation)
- **SVG processing:** svgwrite or lxml
- **File handling:** Flask file upload/download endpoints

### Critical Constraint
**No rasterisation.** Track lines, logos, and text must remain vector/scalable throughout. This ensures print-quality crispness at any output size.

---

## Data Structures

### Layout Config
```json
{
  "track_id": "robocup_wellington_2026",
  "sponsors": [
    {
      "id": "sponsor_1",
      "logo_file": "logo_acme.svg",
      "x_mm": 50,
      "y_mm": 100,
      "scale": 1.0,
      "rotation_deg": 0,
      "layer": "background"
    }
  ],
  "text_overlays": [
    {
      "id": "title_1",
      "text": "RoboCup Junior Wellington Regional 2026",
      "x_mm": 100,
      "y_mm": 30,
      "font": "Helvetica",
      "size_pt": 24,
      "colour": "#000000"
    }
  ],
  "print_spec": {
    "page_size": "A2",
    "scale_factor": 1.0,
    "bleed_mm": 5,
    "crop_marks": true
  }
}
```

---

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/tracks/import | Upload or select track SVG geometry |
| POST | /api/logos/upload | Upload sponsor logo file |
| POST | /api/layout/save | Save current layout config |
| GET | /api/layout/{id} | Retrieve saved layout |
| POST | /api/layout/preview | Generate preview image of layout |
| POST | /api/export/pdf | Generate and download print-ready PDF |
| GET | /api/print-specs | List available page sizes and presets |

---

## Deliverables (Phase 1)
- [ ] SVG import and canvas display at print scale
- [ ] Sponsor logo drag-and-drop with rotation and scale
- [ ] Text overlay editor
- [ ] Print specification controls (page size, scale, bleed)
- [ ] Vector PDF export with no rasterisation
- [ ] Multi-page tiling for large courses
- [ ] Undo/redo
- [ ] Layout save and restore

---

## Out of Scope (Phase 1)
- CMYK colour space conversion
- Automatic logo placement suggestions
- Print shop API integration
- Mobile responsiveness
- Raster-only logo handling (logos must be SVG or high-res PNG)

---

## Future Enhancements
- Template library for common event layouts
- QR code generation (links to event details or results)
- CMYK conversion for professional print shops
- Direct print shop upload/ordering integration
- Sponsor branding guidelines checker

---

## Relationship to Simulator
The simulator exports track geometry as SVG. This tool consumes that SVG and produces print-ready PDFs. They are separate tools with separate users — students use the simulator, event organisers use this. Clean data handoff via SVG format keeps them decoupled.
