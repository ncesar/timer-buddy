import { create } from 'zustand'
import type { Workout, Round, IntervalBlock } from '@/models/workout'

export type TrainingStatus = 'idle' | 'running' | 'paused' | 'rest' | 'completed'

type TrainingStore = {
  workout: Workout | null
  status: TrainingStatus
  currentRoundIndex: number
  elapsed: number
  restElapsed: number
  currentBlock: IntervalBlock | null
  currentRound: Round | null

  startWorkout: (workout: Workout) => void
  _setStatus: (s: TrainingStatus) => void
  _setElapsed: (n: number) => void
  _setRestElapsed: (n: number) => void
  _setCurrentBlock: (b: IntervalBlock | null) => void
  _advanceRound: () => void
  _reset: () => void
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  workout: null,
  status: 'idle',
  currentRoundIndex: 0,
  elapsed: 0,
  restElapsed: 0,
  currentBlock: null,
  currentRound: null,

  startWorkout: (workout) => set({
    workout,
    status: 'running',
    currentRoundIndex: 0,
    elapsed: 0,
    restElapsed: 0,
    currentBlock: null,
    currentRound: workout.rounds[0] ?? null,
  }),

  _setStatus: (status) => set({ status }),
  _setElapsed: (elapsed) => set({ elapsed }),
  _setRestElapsed: (restElapsed) => set({ restElapsed }),
  _setCurrentBlock: (currentBlock) => set({ currentBlock }),

  _advanceRound: () => {
    const { workout, currentRoundIndex } = get()
    if (!workout) return
    const nextIndex = currentRoundIndex + 1
    set({
      currentRoundIndex: nextIndex,
      elapsed: 0,
      restElapsed: 0,
      currentBlock: null,
      currentRound: workout.rounds[nextIndex] ?? null,
    })
  },

  _reset: () => set({
    workout: null,
    status: 'idle',
    currentRoundIndex: 0,
    elapsed: 0,
    restElapsed: 0,
    currentBlock: null,
    currentRound: null,
  }),
}))
