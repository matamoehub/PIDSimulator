# Line Follower PID Simulator — Project Spec

## Overview
A cloud-based, browser-based PID learning and simulation tool for fast line follower robots. Students discover PID concepts through guided teaching moments, test their tuning on simulated tracks, and ultimately generate code to flash onto real hardware. Designed for Year 8 and above, with progressive abstraction levels from visual blocks through to real C/Arduino code.
Hosted on Ubuntu Linux. Python backend. JavaScript frontend (vanilla JS or React). Desktop-first.

---

## Reference Simulator
The existing IDLINESIM at https://www.idrislaode.com/idlinesim is the primary visual reference. Key features to replicate and extend:
- Dark theme UI
- Left panel: track selection, PID sliders (Kp, Ki, Kd), sampling time, base speed
- Centre: canvas showing robot moving on track in real time
- Right panel: live telemetry — Error (PV), P-Term, I-Term, D-Term as graph panels

**What we add on top:**
- Robot platform selector (with specs)
- Sensor count selector (1 to 16+)
- Sensor array visualization (top-to-bottom, robot's forward perspective)
- Calibration wizard
- Guided PID teaching mode (wizard-style)
- State machine builder (Phase 2)
- Code generation (Phase 3)

---

## Architecture

### Backend (Python)
- **Framework:** Flask or FastAPI
- **Responsibilities:**
  - Simulation engine (robot physics, PID calculations, track geometry)
  - Sensor array model (configurable 1–16+ sensors)
  - Calibration workflow logic
  - Robot platform library management
  - Code generation (Arduino sketch, stub functions, pseudo-code)
  - File download endpoints

### Frontend (JavaScript / React)
- **Rendering:** HTML Canvas or WebGL for simulation, Chart.js or similar for live graphs
- **Real-time updates:** WebSocket for simulation state stream
- **Key components:**
  - Robot platform selector
  - Sensor count selector
  - Calibration wizard modal
  - PID control panel (sliders)
  - Track canvas with robot and sensor overlay
  - Live telemetry graphs
  - State machine builder (Phase 2)
  - Code output panel (Phase 3)

---

## Robot Platform Library
Each platform stores its specs so the simulation behaves realistically for that hardware.

### Supported Platforms (initial set)
| Platform | Sensor Options | Max Speed | Motor Type | Notes |
|---|---|---|---|---|
| LEGO EV3 | 1–2 | ~250 RPM | DC encoded | Block-based and Python |
| LEGO Spike Prime | 1–3 | ~300 RPM | DC encoded | Block-based and Python |
| Generic Arduino (2WD) | 1–8 | ~200 RPM | DC brushed | Arduino C |
| ESP32 with QTR-8RC | 8 | ~300 RPM | DC brushed | Arduino C |
| ESP32 with 16-IR array | 16 | ~500 RPM | DC brushed | Arduino C, multiplexed |
| Cheetah Fast LFR | 8–12 | 6000 RPM | Brushless | Competition robot |
| Generic Fast LFR (Turkey) | 8–16 | 5000–6000 RPM | Brushless | Competition robot |

### Platform Config Structure
```json
{
  "id": "esp32_qtr8",
  "name": "ESP32 with QTR-8RC (8 sensors)",
  "sensor_count_options": [8],
  "sensor_spacing_mm": 10.16,
  "motor_max_rpm": 300,
  "motor_speed_range": [0, 255],
  "default_base_speed": 150,
  "sensor_response_time_ms": 2.5,
  "loop_time_ms": 10,
  "code_target": "arduino"
}
```

---

## Teaching PID — Pedagogy

### Core Principle
Don't lead with maths. Lead with what the robot sees and does. The numbers come after the intuition.

### Analogies (age-appropriate)
**P — Proportional (the spring)**
Think of a spring attached to the line. The further the robot drifts from the centre, the harder the spring pulls it back. If the spring is too weak (low Kp), the robot drifts and can't correct fast enough. If it's too strong (high Kp), the robot snaps back so hard it overshoots and zigzags.

**D — Derivative (the shock absorber)**
The spring is pulling the robot back hard. Without a shock absorber, it bounces past the centre line. Kd detects how fast the error is changing and applies a brake — so the robot lands smoothly instead of oscillating. In fast line followers, PD together is the critical combination for sharp corners.

**I — Integral (the memory)**
If one motor is slightly slower than the other, the robot keeps drifting left by a small amount. P and D don't fully fix it. I keeps a running total of all past errors — and over time, that total gets big enough to push the robot precisely back to centre. In fast robots, Ki is usually 0 because it can cause wild oscillation.

### Teaching Progression
1. **Start slow** — robot crawls at base speed 50 on a straight line, Kp=0. Ask: what happens?
2. **Add P** — ask the student to increase Kp until it stops drifting. What do they notice?
3. **Show oscillation** — push Kp too high on a circle. Watch it zigzag. Ask: what's happening?
4. **Add D** — ask them to increase Kd to smooth it out. What changed?
5. **Try a square** — sharp corners. Watch it fail. Ask: which K value helps corners?
6. **Introduce I** — show a robot with a motor bias. Watch it drift. Then add Ki and watch it self-correct.
7. **Speed up** — now they understand the knobs, push base speed up and retune.

### Wizard Mode
Guided prompts that appear at each stage:
- "What do you think will happen if you increase Kp?"
- "The robot is zigzagging — what does that tell you about Kp?"
- "Try increasing Kd. What changed?"
- "Now try the square track. What's different about corners?"
Students can toggle wizard mode on or off at any point.

---

## Sensor Array Visualization

### View Orientation
Top-to-bottom — robot's forward perspective. The sensor bar is shown at the top of the visualization, and the line passes underneath it as the robot moves forward. This mirrors what the robot physically sees.

### Display
- Row of sensor LEDs (circle indicators) shown horizontally across the top of the canvas
- Each sensor lights up (white/bright) when it detects the black line
- Each sensor dims (dark) when over white background
- Below the sensor bar, a zoomed-in strip shows the line passing beneath the sensor array in slow motion (teaching mode only)
- Calibrated sensor readings shown numerically if in advanced mode

### Sensor Count Options (per platform)
- 1 sensor (single): binary — on or off
- 2 sensors: left and right, simple differential
- 3 sensors: left, centre, right
- 5 sensors: standard beginner
- 8 sensors: QTR-8RC style, common intermediate
- 12 sensors: fast competition standard
- 16 sensors: high-precision, 16-IR array with multiplexer

---

## Calibration Workflow

### Why Calibration Matters (Teaching Moment)
The robot needs to know what "on the line" and "off the line" look like in your environment. Lighting conditions, floor colour, sensor height — all affect readings. Without calibration, the PID calculations are guessing.

### Calibration Steps (Guided Modal)
1. **Introduction screen** — explains why calibration matters, analogy: "it's like your eyes adjusting to a dark room"
2. **White calibration** — robot scans over white background, records minimum sensor values for each sensor
3. **Black calibration** — robot scans over black line, records maximum values
4. **Results display** — shows min/max range per sensor as a bar, highlights any sensors that look wrong
5. **Confirmation** — student confirms or reruns
6. **Stored result** — calibration saved as baseline; used in all subsequent PID error calculations

### Calibration Data Structure
```json
{
  "robot_id": "esp32_qtr8",
  "white_min": [100, 102, 98, 101, 99, 100, 102, 101],
  "black_max": [900, 920, 910, 925, 905, 915, 920, 918],
  "timestamp": "2026-06-15T12:00:00Z"
}
```

---

## Phase 1: Core Simulator

### Tracks (initial set)
| Track | Description | Difficulty |
|---|---|---|
| Straight | Single straight line | Intro |
| Circle | Smooth constant curve | Beginner |
| Oval | Two straights, two curves | Beginner |
| Infinity (figure-8) | Crosses centre, both directions | Intermediate |
| Square | Four sharp 90° corners | Intermediate |
| Rectangle | Longer straights, sharp corners | Intermediate |
| Chicane | S-curve, rapid direction changes | Advanced |
| Competition course | Mixed elements, realistic layout | Advanced |

Track properties: line width (mm), background colour, line colour, track scale.

### Simulation Engine

#### Robot Physics
- Position (x, y) on track canvas
- Heading angle (degrees)
- Left and right motor speeds (derived from PID output)
- Sampling time (Ts) drives update loop
- Base speed configurable per run

#### PID Calculation
```
error = line_position - centre_setpoint
p_term = Kp * error
i_term += Ki * error * Ts
d_term = Kd * (error - previous_error) / Ts
output = p_term + i_term + d_term
left_speed = base_speed + output
right_speed = base_speed - output
```
Motor speeds clamped to platform max range.

#### Error Calculation from Sensors
Weighted average of sensor positions:
```
position = sum(sensor[i] * i * 1000) / sum(sensor[i])
error = position - centre
```

### UI Layout (Phase 1)
```
┌─────────────────────────────────────────────────┐
│  [Robot Platform ▼]  [Sensor Count ▼]  [Calibrate] │
├──────────┬──────────────────────┬───────────────┤
│ CONTROLS │   TRACK CANVAS       │  TELEMETRY    │
│          │                      │               │
│ Track    │  [sensor bar]        │  Error (PV)   │
│ Select   │                      │               │
│          │  [robot on track]    │  P-Term       │
│ Kp  ──○  │                      │               │
│ Ki  ──○  │                      │  I-Term       │
│ Kd  ──○  │                      │               │
│ Ts  ──○  │                      │  D-Term       │
│ Speed ○  │                      │               │
│          │                      │               │
│ [START]  │                      │               │
│ [RESET]  │                      │               │
└──────────┴──────────────────────┴───────────────┘
```
Dark theme. Colour-coded telemetry panels (Error = blue, P = red, I = green, D = orange) matching IDLINESIM reference.

---

## Phase 2: State Machine Builder (Future)
Visual card-based builder. Students define states the robot can be in:
- **Straight** — line centred, go fast
- **Gentle curve** — line slightly off centre, gentle correction
- **Sharp corner** — line far off centre, hard correction
- **Line lost** — no sensors on line, slow and search
- **Cross/junction** — special handling

Each state card shows:
- Trigger condition (sensor pattern)
- PID parameters for that state
- Speed setting

Students arrange cards, test on simulator, then export.
Wizard mode guides: "What should the robot do when it can't see the line at all?"

---

## Phase 3: Code Generation (Future)

### Output Levels

**Beginner (Year 8–9)**
Fully generated Arduino sketch. Student copies and pastes to their robot. Comments explain each section.

**Intermediate (Year 10–11)**
Sketch with calibration constants and PID values filled in. State machine logic is stubbed — student fills in the conditions and actions.

**Advanced (Year 12–13)**
Skeleton only. One stub function per state:
```cpp
void handleStraight() {
  // TODO: implement straight-line PID control
  // Hint: error should be close to 0 here
  // Adjust motor speeds using your tuned Kp and Kd
}
```
Student writes C code inside each stub. Teachable moment: bracket matching, list indexing, variable scope.

### Code Targets
- Arduino / ESP32 (.ino)
- Pseudo-code reference (.txt)
- Block-based description (future, for EV3/Spike)

### Download
Single file download per robot platform. Filename includes platform and date: `lfr_esp32_qtr8_20260615.ino`

---

## API Endpoints (Backend)

### Phase 1
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/robots | List all robot platform configs |
| GET | /api/tracks | List all track types |
| POST | /api/calibrate | Run calibration, return sensor ranges |
| POST | /api/simulate/start | Start simulation session, return session ID |
| WS | /ws/simulate/{session_id} | Stream real-time simulation state |
| POST | /api/simulate/update | Update PID params mid-run |
| POST | /api/simulate/reset | Reset robot to start position |

### Simulation State (WebSocket payload, each tick)
```json
{
  "x": 450.2,
  "y": 312.7,
  "heading": 47.3,
  "sensor_readings": [10, 50, 800, 950, 820, 100, 20, 10],
  "sensor_active": [false, false, true, true, true, false, false, false],
  "error": -12.5,
  "p_term": -125.0,
  "i_term": -8.3,
  "d_term": 34.2,
  "left_speed": 168,
  "right_speed": 132,
  "tick_ms": 10
}
```

---

## Deliverables by Phase

### Phase 1
- [ ] Robot platform library (config-driven)
- [ ] Track rendering (canvas, all track types)
- [ ] Robot physics and movement engine
- [ ] PID calculation engine
- [ ] Sensor array simulation (configurable count)
- [ ] Sensor visualization (top-to-bottom, lights on/off)
- [ ] Live telemetry graphs (Error, P, I, D)
- [ ] Calibration wizard
- [ ] PID sliders with real-time response
- [ ] Wizard/guided teaching mode
- [ ] Play/pause/reset controls

### Phase 2
- [ ] State machine card builder
- [ ] State-based PID tuning
- [ ] Complex track types (chicane, competition)
- [ ] State simulation and testing

### Phase 3
- [ ] Beginner code generation (full sketch)
- [ ] Intermediate code generation (partial)
- [ ] Advanced skeleton generation
- [ ] File download endpoint
- [ ] Block-based output (EV3/Spike)

---

## Out of Scope (Phase 1)
- User accounts or multi-student sessions — *now a planned shared capability:
  student sign-in (username + teacher-assigned PIN) with per-user saved
  files/settings across sessions. See "User Accounts & Saved Work" in
  `simulator-framework-spec.md`. Not in the Phase 1 core; the engine and
  auto-save are designed so it can be added without rework.*
- Mobile responsiveness
- Custom track builder
- Actual robot connection / Bluetooth upload
- Block-based code output
