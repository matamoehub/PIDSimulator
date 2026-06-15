# Matamoe Robotics Simulator Framework Spec

## Overview
A pluggable, modular simulator framework that supports multiple robotics challenge types on a shared core engine. The Line Follower PID Simulator is the first module. Additional challenge types — maze solving, obstacle avoidance, sumo, rescue, object detection — plug into the same framework, reusing the same UI shell, teaching tools, and code generation pipeline.
One platform. Many robotics concepts. Consistent learning experience across year levels.

---

## Design Philosophy
- **Sensor in, motor out.** Every robotics challenge follows the same pattern: sensors read the environment, a control algorithm decides what to do, motors act. The framework models this loop.
- **Teach the concept, not just the tool.** Each module has a guided teaching mode that walks students through the underlying concept before they tune or code.
- **Progressive abstraction.** Year 8 uses visual blocks. Year 10 uses state machines. Year 12 writes actual code. Same simulator, different depth.
- **Auto-save always.** State persists constantly. Students can walk away and come back without losing work.
- **Goldfish attention span.** Tutorial guidance is always one tap away. Students can jump back at any point.

---

## Framework Architecture

### Core Engine (shared across all modules)
- Robot physics model (position, heading, velocity, motor control)
- Sensor simulation (configurable type and count per module)
- Real-time canvas rendering (track/arena/environment)
- Live telemetry graphs (configurable signals per module)
- WebSocket state streaming (backend to frontend, real-time)
- Auto-save and session restore
- Guided wizard engine (question prompts, hints, highlight overlays)
- Code generation pipeline (beginner, intermediate, advanced levels)
- Robot platform library (shared across all modules)

### Module Interface
Each challenge type implements:
- **Environment definition** (track, arena, maze, field geometry)
- **Sensor model** (what sensors the robot has, how they read the environment)
- **Control algorithm interface** (what the student configures or codes)
- **Success criteria** (how to measure performance — lap time, completion, score)
- **Teaching curriculum** (wizard steps, guided questions, learning objectives)
- **Code generation templates** (per platform, per abstraction level)

### Backend (Python / Flask or FastAPI)
- Core simulation engine
- Module loader (plugin architecture)
- Robot platform library
- Session management and auto-save
- Code generation
- File download endpoints
- WebSocket server for real-time state

### Frontend (JavaScript / React)
- Shared UI shell (nav, robot selector, telemetry panels, wizard overlay)
- Module-specific canvas renderer
- Module-specific controls panel
- State machine builder (Phase 2, shared across modules)
- Code output panel (Phase 3, shared across modules)

---

## Robot Platform Library (shared)
Platforms are defined once and used across all modules.

| Platform | Code Target | Notes |
|---|---|---|
| LEGO EV3 | Block / Python | 1–2 sensors standard |
| LEGO Spike Prime | Block / Python | Good for beginners |
| Generic Arduino 2WD | Arduino C | Flexible, cheap |
| ESP32 with QTR-8RC | Arduino C | 8 sensor standard |
| ESP32 with 16-IR array | Arduino C | High precision |
| Cheetah Fast LFR | Arduino C | Competition robot |
| Generic Fast LFR | Arduino C | Turkish kit robots |
| TurboPi (Hiwonder) | Python / ROS2 | Camera, mecanum wheels |

---

## Simulator Modules

### Module 1: Line Follower PID (Phase 1 — build first)
See: `linefollower-sim-spec.md`
Teaching concepts: PID control, sensor arrays, calibration, feedback loops.
Sensors: IR reflectance array (1–16 sensors).
Robot platforms: All Arduino/ESP32 platforms, LEGO.
Tracks: Straight, circle, oval, infinity, square, chicane, competition course, custom.

---

### Module 2: Maze Solving
Teaching concepts: Graph traversal algorithms, decision trees, dead reckoning, mapping.
Sensors: Ultrasonic distance sensors (front, left, right), optional IR wall detection.
Algorithms students explore:
- Wall follower (left hand rule / right hand rule)
- Dead-end filling (flood fill)
- Tremaux algorithm
- A* pathfinding (advanced)
Environment: Grid-based maze, configurable size and complexity. Includes dead ends, loops, multiple paths. Students can import custom mazes.
Success criteria: Time to solve, number of wrong turns, efficiency ratio.
Teaching mode wizard:
- "The robot can only see what's directly beside it. What does it know?"
- "What happens if you always follow the left wall?"
- "Where does the wall follower fail?"
Code output: Decision logic per direction state (left open, front blocked, etc.)
Robot platforms: Arduino 2WD, LEGO EV3, LEGO Spike.

---

### Module 3: Obstacle Avoidance
Teaching concepts: Reactive control, potential fields, path planning, sensor fusion.
Sensors: Ultrasonic distance (configurable count and angle), optional IR cliff detection.
Modes:
- **Reactive** — simple if/then rules (if distance < threshold, turn)
- **Potential fields** — obstacles repel, goal attracts (intermediate)
- **Path planning** — pre-compute route around obstacles (advanced)
Environment: Open field with static and optionally moving obstacles. Goal marker at far end. Students configure obstacle density and placement.
Success criteria: Reach goal without collision, path efficiency.
Teaching mode wizard:
- "What should the robot do when it detects something 20cm ahead?"
- "What's the difference between avoiding and navigating?"
- "What happens if two obstacles are very close together?"
Code output: Sensor threshold config, avoidance algorithm skeleton.
Robot platforms: Arduino 2WD, ESP32, TurboPi.

---

### Module 4: Sumo Wrestling
Teaching concepts: Strategy, force and momentum, sensor fusion, competitive tuning.
Sensors: IR edge detection (to stay in ring), ultrasonic or IR opponent detection.
Environment: Circular sumo ring (standard dohyo dimensions). Two robots — student's robot vs. configurable AI opponent.
Student configures:
- Search strategy (spin, edge patrol, charge)
- Attack speed and direction
- Retreat conditions
AI opponent difficulty levels: Passive, standard, aggressive, random.
Success criteria: Push opponent out of ring within time limit.
Teaching mode wizard:
- "How does the robot know it's near the edge?"
- "What should it do when it detects the opponent?"
- "How does speed affect pushing force?"
Code output: State machine for search → detect → attack → retreat cycle.
Robot platforms: Arduino 2WD (mini sumo standard).

---

### Module 5: RoboCup Rescue
Teaching concepts: Multi-sensor fusion, colour recognition, decision making, mapping.
Sensors: Colour sensor, IR reflectance, ultrasonic, optional camera.
Environment: Rescue arena — coloured tiles representing victims, obstacles, ramps (simplified 2D for simulator). Mirrors RoboCup Junior Rescue Line rules.
Student configures:
- Victim detection logic (colour threshold)
- Navigation priority
- Obstacle handling
Success criteria: Victims found, time taken, tiles traversed.
Teaching mode wizard:
- "How does the robot tell a victim tile from a normal tile?"
- "What should it do when it finds a victim?"
- "What's different about a ramp versus flat floor?"
Code output: Multi-sensor fusion logic, state machine per arena zone.
Robot platforms: LEGO EV3, LEGO Spike, Arduino with colour sensor.
Relevance: Directly aligned with RoboCup Junior Rescue Line. Useful for Matamoe and Wellington regional competition preparation.

---

### Module 6: Object Detection & Pickup (Future)
Teaching concepts: Computer vision basics, gripper control, coordinate systems.
Sensors: Camera (simulated), colour detection, distance sensor.
Environment: Arena with coloured blocks. Robot must identify, navigate to, and pick up target blocks.
Robot platforms: TurboPi (camera arm), LEGO Spike (gripper).

---

## Shared Teaching Features (across all modules)

### Guided Wizard Mode
- Contextual prompts at each learning stage
- "What do you think will happen if...?"
- "Try changing X and observe Y"
- Highlights relevant sensor or telemetry panel when referenced
- Always accessible — toggle on/off mid-session
- Progress tracked per module per student (future: accounts)

### Auto-Save
- Full simulation state saved after every meaningful change
- Session restore on page reload
- Named saves (optional) for comparing tuning attempts
- **Signed-out:** state persists to browser localStorage (single device).
- **Signed-in:** the same session-state object is persisted server-side, keyed
  by the student's account, so work resumes on any device across sessions. This
  is where a signed-in student's saved files/settings live — see
  *User Accounts & Saved Work* below.

### User Accounts & Saved Work (shared)

Students learn over multiple sessions, so they sign in and their work persists
to their own account. This is a shared capability across all modules (a student
has one account; each module saves under it).

**Roles**
- **Student** — signs in with a **username + numeric PIN**. The PIN is
  **assigned by a teacher** (no self-registration — keeps it classroom-safe and
  age-appropriate). Logs in, works, and their settings/files auto-save to their
  account.
- **Teacher** — provisions student accounts, assigns and resets PINs, and can
  view a student's saved work/progress. Teacher tools live behind the existing
  admin area.

**Sign-in flow**
1. Student enters username + PIN on a login screen.
2. Backend validates against the teacher-provisioned account (PINs stored
   hashed, never in plaintext) and issues a session token.
3. All subsequent auto-saves and named saves are tied to that account.
4. Sign-out ends the session; anonymous use (localStorage only) still works for
   students without an account, and local state can be adopted into the account
   on first sign-in.

**What gets saved per student** (this *is* the Session State object below, now
keyed by a real account instead of an anonymous session id):
- Per module: PID params, base speed, sampling time, selected track/environment
- Selected robot platform + sensor count
- Calibration data per robot platform
- State machine (Phase 2) and code-gen preferences (Phase 3)
- Named saves (multiple tuning attempts) and wizard/teaching progress

**Where the saved info lives (in the feature set)**
- It rides on the **Auto-Save** feature: when signed in, the session-state JSON
  is written **server-side keyed by `user_id`** instead of only localStorage.
- Storage sits alongside the existing runtime data directory — e.g.
  `data/users/<user_id>/sessions/…` and an accounts store for usernames +
  hashed PINs (a small database can replace flat files as it scales). This keeps
  it consistent with how robots/courses are already stored outside the git tree.
- Teacher account management is exposed through the admin/ops area.

**API additions**

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | username + PIN → session token |
| POST | /api/auth/logout | end the session |
| GET | /api/users/me | current signed-in account |
| GET | /api/sessions | list this student's saved/named sessions |
| GET | /api/sessions/{id} | load a saved session |
| PUT | /api/sessions/{id} | save/update (the auto-save target) |
| POST | /api/sessions | create a named save |
| POST | /api/admin/students | teacher: create a student account |
| POST | /api/admin/students/{id}/pin | teacher: assign / reset a PIN |

**Roadmap note:** full student accounts were sketched for Phase 5; a lightweight
sign-in + per-user save is a shared capability that can land earlier, whenever
multi-session persistence is needed (it does not block the Phase 1 core).

### State Machine Builder (Phase 2, shared)
- Visual card-based state editor
- Works across all modules (different state types per module)
- Connects to code generation pipeline

### Code Generation (Phase 3, shared)
Three abstraction levels across all modules:
**Beginner:** Full generated code, copy-paste ready.
**Intermediate:** Constants and config filled in, logic stubbed.
**Advanced:** Skeleton functions only, student writes C/Python inside stubs.

---

## Track / Environment Editor (Phase 2)
Shared across modules:
- Draw custom tracks (line follower)
- Design custom mazes (maze solving)
- Place obstacles (obstacle avoidance)
- Import from video (detect geometry from competition footage)
- Export as SVG (for print production tool)

---

## Video-to-Track Import (Phase 3)
Upload a video of a real competition track or arena. Tool analyses geometry — curves, angles, line width, dimensions — and generates a simulator-ready environment. Approximate first pass, user tweaks in editor.
Useful for: Replicating real RoboCup Junior tracks, Turkey fast LFR courses, custom events.

---

## Data Architecture

### Account (teacher-provisioned)
```json
{
  "user_id": "u_8f2a",
  "username": "te_aroha_r",
  "role": "student",
  "pin_hash": "...",
  "created_by": "teacher_id",
  "created_at": "2026-06-15T09:00:00Z"
}
```
PINs are stored hashed only. Teachers create accounts and assign/reset PINs.

### Session State (auto-saved, per module)
When signed in, `user_id` references the account above and the object is stored
server-side under that account; when signed out it is the anonymous session id
held in localStorage.
```json
{
  "user_id": "u_8f2a",
  "save_name": "circle attempt 3",
  "module": "line_follower",
  "robot_platform": "esp32_qtr8",
  "calibration": { ... },
  "pid_params": { "kp": 15, "ki": 0, "kd": 25 },
  "track": "chicane",
  "base_speed": 150,
  "state_machine": { ... },
  "last_saved": "2026-06-15T14:30:00Z"
}
```

### Module Definition
```json
{
  "id": "maze_solver",
  "name": "Maze Solving",
  "version": "1.0",
  "sensors": ["ultrasonic_left", "ultrasonic_front", "ultrasonic_right"],
  "robot_platforms": ["arduino_2wd", "lego_ev3", "lego_spike"],
  "environments": ["5x5_grid", "10x10_grid", "custom"],
  "wizard_steps": [ ... ],
  "code_templates": { ... },
  "success_metrics": ["time_seconds", "wrong_turns", "efficiency_ratio"]
}
```

---

## Development Roadmap
| Phase | Deliverable |
|---|---|
| 1 | Line Follower PID Simulator (core engine + first module) |
| 2 | State machine builder, track/environment editor, Maze Solving module |
| 3 | Code generation pipeline, Obstacle Avoidance module |
| 4 | Sumo Wrestling module, RoboCup Rescue module |
| 5 | Video-to-track import, Object Detection module, student accounts |

---

## Why This Matters for Matamoe
- One platform supports the full robotics curriculum from Year 8 to Year 13
- Each module maps to a real competition (RoboCup Rescue, Sumo, Fast LFR)
- Progressive abstraction means the same tool grows with the student
- New Zealand students get access to world-class simulation tooling for free
- Sponsorship and branding built in via the track printing tool
- Open source potential — could be used nationally and internationally
