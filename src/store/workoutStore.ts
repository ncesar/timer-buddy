import { create } from 'zustand'
import { getStorage } from '@/services/db'
import type { Workout } from '@/models/workout'
import { generateId } from '@/utils/id'

type WorkoutStore = {
  workouts: Workout[]
  loaded: boolean
  loadWorkouts: () => Promise<void>
  saveWorkout: (workout: Workout) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  importWorkout: (json: string) => Promise<void>
  exportWorkout: (id: string) => string
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  loaded: false,

  loadWorkouts: async () => {
    const storage = await getStorage()
    const workouts = await storage.getAllWorkouts()
    workouts.sort((a, b) => b.updatedAt - a.updatedAt)
    set({ workouts, loaded: true })
  },

  saveWorkout: async (workout) => {
    const storage = await getStorage()
    await storage.putWorkout(workout)
    const workouts = get().workouts.filter(w => w.id !== workout.id)
    set({ workouts: [workout, ...workouts] })
  },

  deleteWorkout: async (id) => {
    const storage = await getStorage()
    await storage.deleteWorkout(id)
    set({ workouts: get().workouts.filter(w => w.id !== id) })
  },

  importWorkout: async (json) => {
    const data = JSON.parse(json) as Workout
    const workout: Workout = { ...data, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() }
    await get().saveWorkout(workout)
  },

  exportWorkout: (id) => {
    const workout = get().workouts.find(w => w.id === id)
    if (!workout) throw new Error('Workout not found')
    return JSON.stringify(workout, null, 2)
  },
}))
