// Guided PID teaching progression.
//
// Lesson shape:
//   type     — 'intro' (concept slide, no simulator activity) | 'exercise' (default)
//   diagram  — key into DIAGRAMS map in WizardPanel (intro slides only)
//   setup    — applied by the "Apply setup" button (exercises only)
//   highlight — rings the relevant controls / telemetry panels
//   goal     — one-line objective shown in italic
//   steps    — checklist activities the student ticks off manually

export const LESSONS = [
  // ── Intro slides ──────────────────────────────────────────────────────────
  {
    id: 'intro-robot',
    type: 'intro',
    diagram: 'line-sensor',
    title: 'What does a line-follower do?',
    goal: 'Understand how the robot senses the line and what "error" means.',
    body: 'The robot has a row of IR sensors on its nose. Each sensor reports whether it sees a dark (line) or light (track surface) surface. The simulator combines these into a single number called the position — the weighted centre of all the sensors that are over the line.',
    steps: [
      'Look at the diagram: which sensors are lit up (green)?',
      'The "error" is how far that position is from the centre of the array.',
      'When the robot is perfectly on the line, error = 0.',
      'When the robot drifts right, error becomes positive. Left → negative.',
    ],
    setup: null,
    highlight: ['sensor'],
  },
  {
    id: 'intro-pid',
    type: 'intro',
    diagram: 'pid-loop',
    title: 'The PID control loop',
    goal: 'See how the simulator turns sensor data into motor commands every Ts milliseconds.',
    body: 'PID is a feedback loop that runs at a fixed rate (every Ts ms). Each tick it reads the sensors, calculates an error, runs the PID formula, and turns the result into motor speeds. The robot moves, the sensors are read again, and the loop repeats — thousands of times per second on real hardware.',
    steps: [
      'Trace the loop in the diagram: sensors → error → PID → motors → robot → back to sensors.',
      'The PID block runs one formula: output = Kp·error + Ki·∫error + Kd·(Δerror/Ts).',
      'A large output steers hard. Small output = gentle correction.',
      'Open the Code panel — you can see this exact loop written out.',
    ],
    setup: null,
    highlight: ['ts'],
  },
  {
    id: 'intro-terms',
    type: 'intro',
    diagram: 'terms',
    title: 'What do Kp, Ki, and Kd do?',
    goal: 'Build a mental model of each tuning knob before touching them.',
    body: 'The three gains are the only knobs you tune. Each one shapes the correction in a different way. Most line followers only need Kp and Kd — Ki is a fine-trim for persistent drift. Start with I = 0 and only add it once P and D are working.',
    steps: [
      'Read each card: P = spring, I = memory, D = brake.',
      'Which term would make the robot react faster to being off-centre?',
      'Which term would damp a left-right wobble?',
      'Which term would slowly fix a robot that always runs slightly left?',
    ],
    setup: null,
    highlight: ['kp', 'ki', 'kd'],
  },

  // ── Guided exercises ──────────────────────────────────────────────────────
  {
    id: 'start-slow',
    title: '4 · Start slow — no steering',
    goal: 'See what happens when the robot has no way to correct itself.',
    body: 'With Kp = 0 the PID output is always zero — the robot drives at a fixed speed with no steering. It starts with a small heading angle so it drifts off the line. There is nothing to pull it back.',
    steps: [
      'Click "Apply setup" then press Start.',
      'The robot drifts off the straight line and keeps going — no correction.',
      'Open the Code panel and find the output formula. With Kp = 0, output = 0 × error = always 0.',
      'Nudge Kp to 2 on the slider, then Reset and Start again. Can you see a weak pull?',
    ],
    setup: { track: 'straight', kp: 0, ki: 0, kd: 0, base: 50, initHeadingDeg: 10 },
    highlight: ['kp'],
  },
  {
    id: 'add-p',
    title: '5 · Add P — the spring',
    goal: 'Understand how Kp pulls the robot back to the centre line.',
    body: 'Kp acts like a spring: the further the robot is from the line, the harder it pulls. A small Kp barely corrects; a large one corrects quickly — but may overshoot.',
    steps: [
      'Apply setup (Kp = 20), press Start on the straight track.',
      'Watch the robot snap back to the line — P-term is working.',
      'Raise Kp to 40, Reset and Start — it corrects faster. Watch the P-term graph.',
      'Raise Kp to 60 — does it still track cleanly or does it wobble?',
      'Find the highest Kp that stays smooth on a straight. Note the value.',
    ],
    setup: { track: 'straight', kp: 20, ki: 0, kd: 0, base: 80 },
    highlight: ['kp'],
  },
  {
    id: 'oscillation',
    title: '6 · Too much spring — oscillation',
    goal: 'See how a high Kp causes the robot to zigzag uncontrollably.',
    body: 'On a curve, a strong spring snaps the robot back too hard so it overshoots the line — then snaps back again. The Error graph swings back and forth. This is oscillation.',
    steps: [
      'Apply setup (Kp = 60, circle track), press Start.',
      'Watch the trail — the robot zigzags around the line instead of following it.',
      'Look at the Error telemetry graph — it swings symmetrically back and forth.',
      'Lower Kp slowly (60 → 50 → 40) until the zigzag calms down. What value works?',
    ],
    setup: { track: 'circle', kp: 60, ki: 0, kd: 0, base: 150 },
    highlight: ['kp', 'telemetry'],
  },
  {
    id: 'add-d',
    title: '7 · Add D — the shock absorber',
    goal: 'Use Kd to damp oscillation and smooth out corners.',
    body: 'Kd brakes when the error is changing fast — it opposes rapid swings. Adding D lets you keep a high Kp without the zigzag. PD together is the standard combination for fast robots.',
    steps: [
      'Apply setup (Kp = 40, Kd = 25, circle), press Start.',
      'Compare with the previous step — the zigzag is damped even though Kp is still high.',
      'Watch the D-term graph — it spikes when the error changes fast (on corners).',
      'Try Kd = 60 — the robot becomes sluggish. Too much D slows the correction.',
      'Try Kd = 10 — the zigzag returns. Find the sweet spot between 15 and 35.',
    ],
    setup: { track: 'circle', kp: 40, ki: 0, kd: 25, base: 150 },
    highlight: ['kd', 'telemetry'],
  },
  {
    id: 'sharp-corners',
    title: '8 · Sharp corners — the square track',
    goal: 'Tune PD gains to handle 90° corners without losing the line.',
    body: 'The square track has four sharp 90° corners. The robot must brake the overshoot and re-acquire the line quickly. D-term is your friend here — it fires hardest when the error spikes on a corner.',
    steps: [
      'Apply setup (square track), press Start.',
      'Watch the first corner — does the robot overshoot and lose the line?',
      'If it flies off: increase Kd. If it crawls around: increase Kp.',
      'Try Kd = 40, Kp = 45. Watch all four corners in the trail.',
      'Find the fastest base_speed where it still makes every corner cleanly.',
    ],
    setup: { track: 'square', kp: 45, ki: 0, kd: 30, base: 120 },
    highlight: ['kd'],
  },
  {
    id: 'introduce-i',
    title: '9 · Add I — the memory',
    goal: 'See how Ki fixes a persistent drift that P and D cannot fully correct.',
    body: 'If the robot keeps running slightly off-centre, a tiny steady error exists that P never fully eliminates. Ki accumulates past error over time and builds a correction that pushes the robot exactly back to centre — like nudging a rudder gradually.',
    steps: [
      'Apply setup (Ki = 2, oval), press Start.',
      'Watch the I-term graph — it grows slowly, unlike the spiky P and D terms.',
      'Let it run two full laps. Does the steady offset shrink over time?',
      'Try Ki = 10 — the integral winds up too fast and causes instability.',
      'Keep Ki small (1–4). I is a fine-trim knob, not a main driver.',
    ],
    setup: { track: 'oval', kp: 35, ki: 2, kd: 20, base: 130 },
    highlight: ['ki'],
  },
  {
    id: 'speed-up',
    title: '10 · Speed up — real tuning',
    goal: 'Combine all three terms and push for the fastest stable lap.',
    body: 'You know what each knob does. Now tune for speed: push base_speed up and re-balance Kp and Kd to keep the robot on the line. This is exactly what real line-follower tuning feels like.',
    steps: [
      'Apply setup, then push base speed to 220 and press Start.',
      'Does it stay on the oval? Adjust Kp and Kd until it does.',
      'Switch to the figure-8 track — the crossover is the hardest part.',
      'Now try the competition track at speed. What breaks first?',
      'Record your best Kp, Kd, and base. Open Code and copy your Arduino sketch.',
    ],
    setup: { track: 'oval', kp: 40, ki: 0, kd: 25, base: 200 },
    highlight: ['base', 'kp', 'kd'],
  },
]
