// Fixed-timestep driver. Accumulates real wall-clock time and advances the
// engine one Ts per step, so simulated time tracks real time and the physics is
// independent of the display refresh rate. `getTsMs` is read each frame so a
// live change to the sampling time takes effect immediately.

export function createLoop(stepFn, getTsMs, onFrame) {
  let raf = null
  let running = false
  let last = 0
  let acc = 0

  function frame(now) {
    if (!running) return
    if (!last) last = now
    let dt = now - last
    last = now
    if (dt > 250) dt = 250 // clamp after a tab switch to avoid a step spiral
    acc += dt

    const ts = getTsMs()
    let tick = null
    let guard = 0
    while (acc >= ts && guard < 1000) {
      tick = stepFn()
      acc -= ts
      guard += 1
    }
    if (tick && onFrame) onFrame(tick)
    raf = requestAnimationFrame(frame)
  }

  return {
    start() {
      if (running) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = null
    },
    get running() {
      return running
    },
  }
}
