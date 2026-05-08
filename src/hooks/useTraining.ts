import { useRef, useCallback, useEffect } from 'react'
import { useTrainingStore } from '@/store/trainingStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTimer } from '@/hooks/useTimer'
import { useVibration } from '@/hooks/useVibration'
import { tts } from '@/services/tts'
import { playBell, playBeep, playDoubleBeep, unlockAudio } from '@/services/audio'
import { requestWakeLock, releaseWakeLock } from '@/services/wakeLock'
import type { Workout, IntervalRound, InstructionRound, IntervalBlock } from '@/models/workout'

const getIntervalBlock = (round: IntervalRound, elapsed: number): IntervalBlock => {
  const total = round.blocks.reduce((s, b) => s + b.duration, 0)
  if (total === 0) return round.blocks[0]
  const pos = elapsed % total
  let acc = 0
  for (const block of round.blocks) {
    acc += block.duration
    if (pos < acc) return block
  }
  return round.blocks[round.blocks.length - 1]
}

const getCurrentCycleIndex = (round: IntervalRound, elapsed: number): number => {
  const total = round.blocks.reduce((s, b) => s + b.duration, 0)
  return total > 0 ? Math.floor(elapsed / total) : 0
}

export const useTraining = () => {
  const store = useTrainingStore()
  const settings = useSettingsStore()
  const { vibrate } = useVibration()

  const prevElapsedRef = useRef(0)
  const prevRestElapsedRef = useRef(0)
  const prevBlockIdRef = useRef<string | null>(null)
  const prevCycleRef = useRef(0)
  const firedInstructionsRef = useRef<Set<string>>(new Set())

  // Sync TTS settings
  useEffect(() => {
    tts.enabled = settings.ttsEnabled
    tts.rate = settings.ttsRate
    tts.voiceURI = settings.ttsVoiceURI
  }, [settings.ttsEnabled, settings.ttsRate, settings.ttsVoiceURI])

  const handleRoundTick = useCallback((elapsed: number) => {
    const { workout, currentRoundIndex, status } = useTrainingStore.getState()
    if (!workout || status !== 'running') return

    const round = workout.rounds[currentRoundIndex]
    if (!round) return

    const remaining = round.duration - elapsed
    const prevSecond = Math.floor(prevElapsedRef.current)
    const currentSecond = Math.floor(elapsed)

    useTrainingStore.getState()._setElapsed(elapsed)

    // Countdown beeps: last 10 seconds
    if (currentSecond > prevSecond && remaining <= 10 && remaining > 0) {
      const { soundEnabled, countdownBeepsEnabled } = useSettingsStore.getState()
      if (soundEnabled && countdownBeepsEnabled) playBeep()
    }

    // Round complete
    if (elapsed >= round.duration) {
      advanceFromRound()
      return
    }

    // IntervalRound: detect block transitions
    if (round.type === 'interval' && round.blocks.length > 0) {
      const block = getIntervalBlock(round, elapsed)
      const cycle = getCurrentCycleIndex(round, elapsed)

      if (block.id !== prevBlockIdRef.current || cycle !== prevCycleRef.current) {
        prevBlockIdRef.current = block.id
        prevCycleRef.current = cycle
        useTrainingStore.getState()._setCurrentBlock(block)
        vibrate(100)
        if (block.voiceCommand) {
          const { ttsEnabled } = useSettingsStore.getState()
          if (ttsEnabled) tts.speak(block.voiceCommand)
        }
      }
    }

    // InstructionRound: fire voice cues at specific seconds
    if (round.type === 'instruction' && currentSecond > prevSecond) {
      const r = round as InstructionRound
      for (const inst of r.instructions) {
        const key = `${inst.id}-${currentSecond}`
        if (firedInstructionsRef.current.has(key)) continue

        const shouldFire = currentSecond === inst.atSecond ||
          (inst.repeat && inst.repeatInterval && inst.repeatInterval > 0 &&
            currentSecond > inst.atSecond &&
            (currentSecond - inst.atSecond) % inst.repeatInterval === 0)

        if (shouldFire) {
          firedInstructionsRef.current.add(key)
          const { ttsEnabled } = useSettingsStore.getState()
          if (ttsEnabled) tts.speak(inst.text)
          vibrate(100)
        }
      }
    }

    prevElapsedRef.current = elapsed
  }, [vibrate])

  const handleRestTick = useCallback((restElapsed: number) => {
    const { workout, currentRoundIndex, status } = useTrainingStore.getState()
    if (!workout || status !== 'rest') return

    const round = workout.rounds[currentRoundIndex]
    const restDuration = round?.restAfter ?? 0

    useTrainingStore.getState()._setRestElapsed(restElapsed)

    const remaining = restDuration - restElapsed
    const prevSecond = Math.floor(prevRestElapsedRef.current)
    const currentSecond = Math.floor(restElapsed)

    if (currentSecond > prevSecond && remaining <= 5 && remaining > 0) {
      const { soundEnabled, countdownBeepsEnabled } = useSettingsStore.getState()
      if (soundEnabled && countdownBeepsEnabled) playBeep()
    }

    if (restElapsed >= restDuration) {
      startNextRound()
    }

    prevRestElapsedRef.current = restElapsed
  }, [])

  const roundTimer = useTimer({ onTick: handleRoundTick })
  const restTimer = useTimer({ onTick: handleRestTick })

  const advanceFromRound = useCallback(() => {
    const { workout, currentRoundIndex } = useTrainingStore.getState()
    if (!workout) return

    roundTimer.pause()
    roundTimer.reset()
    prevElapsedRef.current = 0
    firedInstructionsRef.current.clear()
    prevBlockIdRef.current = null
    prevCycleRef.current = 0

    const { soundEnabled } = useSettingsStore.getState()
    if (soundEnabled) playDoubleBeep()
    vibrate([100, 100, 200])

    const currentRound = workout.rounds[currentRoundIndex]
    const isLast = currentRoundIndex >= workout.rounds.length - 1

    if (isLast) {
      useTrainingStore.getState()._setStatus('completed')
      releaseWakeLock()
      tts.cancel()
      return
    }

    if (currentRound.restAfter && currentRound.restAfter > 0) {
      useTrainingStore.getState()._setStatus('rest')
      prevRestElapsedRef.current = 0
      restTimer.start()
      const { ttsEnabled } = useSettingsStore.getState()
      if (ttsEnabled) tts.speak('Rest')
    } else {
      startNextRound()
    }
  }, [roundTimer, restTimer, vibrate])

  const startNextRound = useCallback(() => {
    const { workout } = useTrainingStore.getState()
    if (!workout) return

    restTimer.pause()
    restTimer.reset()
    prevRestElapsedRef.current = 0

    useTrainingStore.getState()._advanceRound()
    useTrainingStore.getState()._setStatus('running')

    const nextIndex = useTrainingStore.getState().currentRoundIndex
    const nextRound = workout.rounds[nextIndex]

    const { soundEnabled, ttsEnabled } = useSettingsStore.getState()
    if (soundEnabled) playBell()
    if (ttsEnabled) tts.speak(`Round ${nextIndex + 1}${nextRound ? ', ' + nextRound.name : ''}`)
    vibrate(200)

    roundTimer.start()
  }, [restTimer, roundTimer, vibrate])

  const startTraining = useCallback((workout: Workout) => {
    // iOS: unlock audio + TTS synchronously on user gesture
    unlockAudio()
    tts.speak('Ready. Round 1')

    requestWakeLock()

    store.startWorkout(workout)
    prevElapsedRef.current = 0
    prevRestElapsedRef.current = 0
    prevBlockIdRef.current = null
    prevCycleRef.current = 0
    firedInstructionsRef.current.clear()

    const { soundEnabled } = useSettingsStore.getState()
    if (soundEnabled) {
      setTimeout(() => playBell(), 800)
    }

    // Set initial block for interval rounds
    const firstRound = workout.rounds[0]
    if (firstRound?.type === 'interval' && firstRound.blocks.length > 0) {
      store._setCurrentBlock(firstRound.blocks[0])
      prevBlockIdRef.current = firstRound.blocks[0].id
    }

    roundTimer.start()
  }, [store, roundTimer])

  const pauseTraining = useCallback(() => {
    store._setStatus('paused')
    if (useTrainingStore.getState().status === 'rest') {
      restTimer.pause()
    } else {
      roundTimer.pause()
    }
  }, [store, roundTimer, restTimer])

  const resumeTraining = useCallback(() => {
    store._setStatus('running')
    if (useTrainingStore.getState().status === 'rest') {
      restTimer.resume()
    } else {
      roundTimer.resume()
    }
  }, [store, roundTimer, restTimer])

  const skipRound = useCallback(() => {
    advanceFromRound()
  }, [advanceFromRound])

  const stopTraining = useCallback(() => {
    roundTimer.reset()
    restTimer.reset()
    tts.cancel()
    releaseWakeLock()
    store._reset()
  }, [store, roundTimer, restTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      roundTimer.reset()
      restTimer.reset()
      tts.cancel()
      releaseWakeLock()
    }
  }, [roundTimer, restTimer])

  return { startTraining, pauseTraining, resumeTraining, skipRound, stopTraining }
}
