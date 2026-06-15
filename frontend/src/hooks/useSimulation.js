import { useCallback, useEffect, useRef, useState } from 'react'
import { Engine } from '../sim/engine.js'
import { createLoop } from '../sim/loop.js'

// Owns the (mutable) Engine and the RAF loop. Returns the latest telemetry tick
// (one React update per frame, not per step) plus playback + parameter setters.
export function useSimulation(initial = {}) {
  const engineRef = useRef(null)
  if (!engineRef.current) engineRef.current = new Engine(initial)
  const engine = engineRef.current

  const [tick, setTick] = useState(() => ({
    x: engine.pose.x, y: engine.pose.y, heading: engine.pose.heading,
    sensor_readings: [], sensor_active: [], sensor_world: [],
    error: 0, p_term: 0, i_term: 0, d_term: 0,
    left_speed: 0, right_speed: 0, line_lost: false, elapsed_ms: 0,
  }))
  const [running, setRunning] = useState(false)

  const loopRef = useRef(null)
  if (!loopRef.current) {
    loopRef.current = createLoop(
      () => engine.step(),
      () => engine.tsMs,
      (t) => {
        setTick(t)
        // Stop automatically if the robot leaves the course.
        if (t.out_of_bounds) { loopRef.current.stop(); setRunning(false) }
      },
    )
  }

  useEffect(() => () => loopRef.current.stop(), [])

  const start = useCallback(() => { loopRef.current.start(); setRunning(true) }, [])
  const pause = useCallback(() => { loopRef.current.stop(); setRunning(false) }, [])
  const reset = useCallback(() => {
    engine.reset()
    setTick((t) => ({ ...t, x: engine.pose.x, y: engine.pose.y, heading: engine.pose.heading }))
  }, [engine])

  const setTrack = useCallback((name) => { engine.setTrack(name); reset() }, [engine, reset])
  const setPlatform = useCallback((p) => { engine.setPlatform(p) }, [engine])
  const setSensorCount = useCallback((n) => { engine.setSensorCount(n) }, [engine])
  const setPid = useCallback((g) => { engine.setPid(g) }, [engine])
  const setBaseSpeed = useCallback((v) => { engine.setBaseSpeed(v) }, [engine])
  const setTsMs = useCallback((v) => { engine.setTsMs(v) }, [engine])

  return {
    engine, tick, running,
    start, pause, reset,
    setTrack, setPlatform, setSensorCount, setPid, setBaseSpeed, setTsMs,
  }
}
