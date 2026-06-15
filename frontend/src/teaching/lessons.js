// Guided PID teaching progression (spec "Teaching Progression" + wizard prompts).
// Each step has a suggested `setup` (loaded by the "Apply setup" button) and a
// set of `highlight` keys that ring the relevant control / telemetry panel.

export const LESSONS = [
  {
    id: 'start-slow',
    title: '1 · Start slow',
    body: 'Press Start. The robot crawls along a straight line with no steering (Kp = 0). Watch what happens when it drifts off the line. Why can\'t it correct itself?',
    setup: { track: 'straight', kp: 0, ki: 0, kd: 0, base: 50 },
    highlight: ['kp'],
  },
  {
    id: 'add-p',
    title: '2 · Add P (the spring)',
    body: 'Kp is a spring pulling the robot back to the centre — the further off, the harder the pull. Raise Kp until it stops drifting and tracks the line. What happens if you push it too high?',
    setup: { track: 'straight', kp: 20, ki: 0, kd: 0, base: 80 },
    highlight: ['kp'],
  },
  {
    id: 'oscillation',
    title: '3 · Too much spring',
    body: 'On a curve a strong spring snaps the robot back too hard, so it overshoots and zig-zags. Watch the Error graph swing back and forth. What could calm the oscillation down?',
    setup: { track: 'circle', kp: 60, ki: 0, kd: 0, base: 150 },
    highlight: ['kp', 'telemetry'],
  },
  {
    id: 'add-d',
    title: '4 · Add D (the shock absorber)',
    body: 'Kd brakes when the error is changing fast, damping the wobble. Increase Kd and watch the zig-zag settle into a smooth line. PD together is the key combination for fast robots.',
    setup: { track: 'circle', kp: 40, ki: 0, kd: 25, base: 150 },
    highlight: ['kd', 'telemetry'],
  },
  {
    id: 'sharp-corners',
    title: '5 · Sharp corners',
    body: 'Now try a square — four sharp 90° corners. Watch where it overshoots. Which knob helps the robot whip around a corner without flying off? (Hint: it is the shock absorber.)',
    setup: { track: 'square', kp: 45, ki: 0, kd: 30, base: 120 },
    highlight: ['kd'],
  },
  {
    id: 'introduce-i',
    title: '6 · Add I (the memory)',
    body: 'If the robot keeps drifting slightly to one side, P and D never quite fix it. Ki adds up past error over time until the robot is pushed exactly back to centre. Add a little Ki — but only a little, too much causes wild oscillation.',
    setup: { track: 'oval', kp: 35, ki: 2, kd: 20, base: 130 },
    highlight: ['ki'],
  },
  {
    id: 'speed-up',
    title: '7 · Speed up',
    body: 'You understand the knobs now. Push the base speed up on a full competition course and re-tune Kp and Kd to keep it on the line at speed. This is what real fast-line-follower tuning feels like.',
    setup: { track: 'competition', kp: 40, ki: 0, kd: 25, base: 200 },
    highlight: ['base', 'kp', 'kd'],
  },
]
