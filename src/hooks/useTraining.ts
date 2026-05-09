import { useRef, useCallback, useEffect } from 'react'
import { useTrainingStore } from '@/store/trainingStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTimer } from '@/hooks/useTimer'
import { useVibration } from '@/hooks/useVibration'
import { tts } from '@/services/tts'
import { playBell, playBeep, playDoubleBeep, unlockAudio } from '@/services/audio'
import { requestWakeLock, releaseWakeLock } from '@/services/wakeLock'
import type { Workout, InstructionRound, IntervalBlock } from '@/models/workout'

const getActiveBlock = (blocks: IntervalBlock[], elapsed: number): IntervalBlock | null => {
  let active: IntervalBlock | null = null
  for (const block of blocks) {
    if (elapsed >= block.atSecond) {
      if (!active || block.atSecond >= active.atSecond) active = block
    }
  }
  return active
}

export const useTraining = () => {
  const store = useTrainingStore()
  const settings = useSettingsStore()
  const { vibrate } = useVibration()

  const prevElapsedRef = useRef(0)
  const prevRestElapsedRef = useRef(0)
  const prevBlockIdRef = useRef<string | null>(null)
  const firedInstructionsRef = useRef<Set<string>>(new Set())
  const firedBlockCuesRef = useRef<Set<string>>(new Set())

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

    // IntervalRound: update active block display + fire voice cues at second boundaries
    if (round.type === 'interval' && round.blocks.length > 0) {
      const activeBlock = getActiveBlock(round.blocks, elapsed)
      if (activeBlock && activeBlock.id !== prevBlockIdRef.current) {
        console.log('[Training] active block changed:', { name: activeBlock.name, atSecond: activeBlock.atSecond })
        prevBlockIdRef.current = activeBlock.id
        useTrainingStore.getState()._setCurrentBlock(activeBlock)
        vibrate(100)
      }

      if (currentSecond > prevSecond) {
        for (const block of round.blocks) {
          const key = `${block.id}-${currentSecond}`
          if (firedBlockCuesRef.current.has(key)) continue

          const shouldFire = currentSecond === block.atSecond ||
            (block.repeat && block.repeatInterval && block.repeatInterval > 0 &&
              currentSecond > block.atSecond &&
              (currentSecond - block.atSecond) % block.repeatInterval === 0)

          if (shouldFire) {
            firedBlockCuesRef.current.add(key)
            if (block.voiceCommand) {
              console.log('[Training] speaking block voice:', block.voiceCommand)
              tts.speak(block.voiceCommand)
            }
          }
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
    firedBlockCuesRef.current.clear()
    prevBlockIdRef.current = null

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
    if (ttsEnabled) {
      const roundNumber = nextIndex + 1
      const defaultName = `Round ${roundNumber}`
      const hasCustomName = nextRound?.name && nextRound.name.trim() !== defaultName
      tts.speak(hasCustomName ? `${defaultName}, ${nextRound!.name}` : defaultName)
    }
    vibrate(200)

    // Fire voice commands for interval blocks at atSecond=0
    if (nextRound?.type === 'interval') {
      for (const block of nextRound.blocks) {
        if (block.atSecond === 0 && block.voiceCommand) {
          tts.speak(block.voiceCommand)
        }
      }
    }

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
    firedInstructionsRef.current.clear()
    firedBlockCuesRef.current.clear()

    const { soundEnabled } = useSettingsStore.getState()
    if (soundEnabled) {
      setTimeout(() => playBell(), 800)
    }

    // Fire voice commands for interval blocks at atSecond=0
    const firstRound = workout.rounds[0]
    if (firstRound?.type === 'interval') {
      for (const block of firstRound.blocks) {
        if (block.atSecond === 0 && block.voiceCommand) {
          tts.speak(block.voiceCommand)
        }
      }
    }

    roundTimer.start()
  }, [store, roundTimer])

  const pauseTraining = useCallback(() => {
    const { status } = useTrainingStore.getState()
    console.log('[Training] pauseTraining — current status:', status)
    store._setStatus('paused')
    tts.speak('Paused')
    if (status === 'rest') {
      restTimer.pause()
    } else {
      roundTimer.pause()
    }
  }, [store, roundTimer, restTimer])

  const resumeTraining = useCallback(() => {
    const { status } = useTrainingStore.getState()
    console.log('[Training] resumeTraining — current status:', status)
    store._setStatus('running')
    tts.speak('Resuming')
    if (status === 'rest') {
      restTimer.resume()
    } else {
      roundTimer.resume()
    }
  }, [store, roundTimer, restTimer])

  const skipRound = useCallback(() => {
    const { status } = useTrainingStore.getState()
    console.log('[Training] skipRound — status:', status)
    if (status === 'rest') {
      startNextRound()
    } else {
      advanceFromRound()
    }
  }, [advanceFromRound, startNextRound])

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
