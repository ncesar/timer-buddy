import Dexie, { type Table } from 'dexie'
import type { Workout, WorkoutHistory } from '@/models/workout'

class TimerBuddyDB extends Dexie {
  workouts!: Table<Workout>
  history!: Table<WorkoutHistory>

  constructor() {
    super('TimerBuddyDB')
    this.version(1).stores({
      workouts: 'id, name, createdAt, updatedAt',
      history: 'id, workoutId, completedAt',
    })
  }
}

const db = new TimerBuddyDB()

// StorageAdapter interface with IndexedDB (Dexie) and localStorage fallback
export interface StorageAdapter {
  getAllWorkouts(): Promise<Workout[]>
  putWorkout(w: Workout): Promise<void>
  deleteWorkout(id: string): Promise<void>
  getAllHistory(): Promise<WorkoutHistory[]>
  putHistory(h: WorkoutHistory): Promise<void>
}

class DexieAdapter implements StorageAdapter {
  async getAllWorkouts() { return db.workouts.toArray() }
  async putWorkout(w: Workout) { await db.workouts.put(w) }
  async deleteWorkout(id: string) { await db.workouts.delete(id) }
  async getAllHistory() { return db.history.toArray() }
  async putHistory(h: WorkoutHistory) { await db.history.put(h) }
}

class LocalStorageAdapter implements StorageAdapter {
  private get<T>(key: string): T[] {
    try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
  }
  private set<T extends { id: string }>(key: string, items: T[]) {
    localStorage.setItem(key, JSON.stringify(items))
  }
  async getAllWorkouts() { return this.get<Workout>('workouts') }
  async putWorkout(w: Workout) {
    const all = this.get<Workout>('workouts').filter(x => x.id !== w.id)
    this.set('workouts', [...all, w])
  }
  async deleteWorkout(id: string) {
    this.set('workouts', this.get<Workout>('workouts').filter(x => x.id !== id))
  }
  async getAllHistory() { return this.get<WorkoutHistory>('history') }
  async putHistory(h: WorkoutHistory) {
    const all = this.get<WorkoutHistory>('history').filter(x => x.id !== h.id)
    this.set('history', [...all, h])
  }
}

async function createAdapter(): Promise<StorageAdapter> {
  try {
    await db.workouts.count()
    return new DexieAdapter()
  } catch {
    return new LocalStorageAdapter()
  }
}

let adapterPromise: Promise<StorageAdapter> | null = null

export const getStorage = (): Promise<StorageAdapter> => {
  if (!adapterPromise) adapterPromise = createAdapter()
  return adapterPromise
}
