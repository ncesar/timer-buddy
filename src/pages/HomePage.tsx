import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '@/store/workoutStore'
import { WorkoutCard } from '@/components/workout/WorkoutCard'
import { Button } from '@/components/ui/Button'

export const HomePage = () => {
  const navigate = useNavigate()
  const { workouts, loaded, loadWorkouts, importWorkout } = useWorkoutStore()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importWorkout(text)
    } catch {
      alert('Invalid workout file')
    }
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-8">
      <div className="px-4 pt-12 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Timer Buddy</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Boxing training timer</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="text-zinc-400 hover:text-white p-2 text-xl"
          aria-label="Settings"
        >
          ⚙
        </button>
      </div>

      <div className="px-4 flex gap-2 mb-6">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/workout/new')}
          className="flex-1"
        >
          + New Workout
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => fileRef.current?.click()}
          className="px-4"
          aria-label="Import"
        >
          ⬆
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      <div className="px-4 flex flex-col gap-3">
        {!loaded && (
          <p className="text-zinc-500 text-center py-8">Loading...</p>
        )}
        {loaded && workouts.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <span className="text-6xl">🥊</span>
            <p className="text-zinc-400 text-lg font-medium">No workouts yet</p>
            <p className="text-zinc-600 text-sm">Create your first training session</p>
          </div>
        )}
        {workouts.map(w => (
          <WorkoutCard key={w.id} workout={w} />
        ))}
      </div>
    </div>
  )
}
