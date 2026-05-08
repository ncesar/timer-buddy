import { useRef, useCallback, useEffect } from 'react'

type TimerCallbacks = {
  onTick: (elapsed: number) => void
}

export type TimerControls = {
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  seek: (seconds: number) => void
  isRunning: () => boolean
}

export const useTimer = (callbacks: TimerCallbacks): TimerControls => {
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const accumulatedRef = useRef<number>(0)
  const runningRef = useRef(false)
  const onTickRef = useRef(callbacks.onTick)
  onTickRef.current = callbacks.onTick

  const tick = useCallback(() => {
    if (!runningRef.current) return
    const elapsed = accumulatedRef.current + (performance.now() - startTimeRef.current) / 1000
    onTickRef.current(elapsed)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    accumulatedRef.current = 0
    startTimeRef.current = performance.now()
    runningRef.current = true
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    accumulatedRef.current += (performance.now() - startTimeRef.current) / 1000
    runningRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  const resume = useCallback(() => {
    startTimeRef.current = performance.now()
    runningRef.current = true
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const reset = useCallback(() => {
    runningRef.current = false
    cancelAnimationFrame(rafRef.current)
    accumulatedRef.current = 0
    startTimeRef.current = 0
  }, [])

  const seek = useCallback((seconds: number) => {
    accumulatedRef.current = seconds
    startTimeRef.current = performance.now()
  }, [])

  const isRunning = useCallback(() => runningRef.current, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return { start, pause, resume, reset, seek, isRunning }
}
