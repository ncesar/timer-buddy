import type { Workout } from '@/models/workout'

export const formatTime = (seconds: number): string => {
  const s = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export const totalWorkoutDuration = (workout: Workout): number =>
  workout.rounds.reduce((sum, r) => sum + r.duration + (r.restAfter ?? 0), 0)
