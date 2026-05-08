import { useNavigate } from 'react-router-dom'
import type { Workout } from '@/models/workout'
import { totalWorkoutDuration, formatTime } from '@/utils/time'
import { useWorkoutStore } from '@/store/workoutStore'
import { Button } from '@/components/ui/Button'

type Props = {
  workout: Workout
}

export const WorkoutCard = ({ workout }: Props) => {
  const navigate = useNavigate()
  const { deleteWorkout, exportWorkout } = useWorkoutStore()

  const handleExport = () => {
    const json = exportWorkout(workout.id)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workout.name.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = () => {
    if (confirm(`Delete "${workout.name}"?`)) deleteWorkout(workout.id)
  }

  const totalDuration = totalWorkoutDuration(workout)

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{workout.name}</h3>
          <p className="text-zinc-400 text-sm mt-0.5">
            {workout.rounds.length} round{workout.rounds.length !== 1 ? 's' : ''} · {formatTime(totalDuration)}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={handleExport} className="text-zinc-500 hover:text-zinc-300 p-1 text-sm" title="Export">⬇</button>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-1 text-sm" title="Delete">🗑</button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/workout/${workout.id}`)} className="flex-1">
          Edit
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate(`/workout/${workout.id}/train`)} className="flex-1">
          Start
        </Button>
      </div>
    </div>
  )
}
