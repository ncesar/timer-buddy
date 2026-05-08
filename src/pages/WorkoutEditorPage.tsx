import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Workout, Round } from '@/models/workout'
import { useWorkoutStore } from '@/store/workoutStore'
import { generateId } from '@/utils/id'
import { RoundEditor } from '@/components/workout/RoundEditor'
import { Button } from '@/components/ui/Button'

const makeNewWorkout = (): Workout => ({
  id: generateId(),
  name: '',
  rounds: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const WorkoutEditorPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { workouts, saveWorkout } = useWorkoutStore()

  const [draft, setDraft] = useState<Workout>(() => {
    if (!id || id === 'new') return makeNewWorkout()
    const found = workouts.find(w => w.id === id)
    return found ? structuredClone(found) : makeNewWorkout()
  })

  // Re-sync draft if workout list loads after mount
  useEffect(() => {
    if (id && id !== 'new' && draft.rounds.length === 0) {
      const found = workouts.find(w => w.id === id)
      if (found) setDraft(structuredClone(found))
    }
  }, [id, workouts, draft.rounds.length])

  const addRound = () => {
    const round: Round = {
      id: generateId(),
      name: `Round ${draft.rounds.length + 1}`,
      duration: 180,
      type: 'simple',
    }
    setDraft(d => ({ ...d, rounds: [...d.rounds, round] }))
  }

  const updateRound = (i: number, round: Round) => {
    setDraft(d => {
      const rounds = [...d.rounds]
      rounds[i] = round
      return { ...d, rounds }
    })
  }

  const removeRound = (i: number) => {
    setDraft(d => ({ ...d, rounds: d.rounds.filter((_, idx) => idx !== i) }))
  }

  const moveRound = (i: number, dir: -1 | 1) => {
    setDraft(d => {
      const rounds = [...d.rounds]
      const j = i + dir
      if (j < 0 || j >= rounds.length) return d
      ;[rounds[i], rounds[j]] = [rounds[j], rounds[i]]
      return { ...d, rounds }
    })
  }

  const handleSave = async () => {
    if (!draft.name.trim()) {
      alert('Please enter a workout name')
      return
    }
    if (draft.rounds.length === 0) {
      alert('Add at least one round')
      return
    }
    await saveWorkout({ ...draft, updatedAt: Date.now() })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur px-4 py-3 flex items-center gap-3 border-b border-zinc-800">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white text-xl p-1">←</button>
        <input
          className="flex-1 bg-transparent text-white text-xl font-bold outline-none placeholder:text-zinc-600"
          placeholder="Workout name"
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        />
        <Button variant="primary" size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {draft.rounds.map((round, i) => (
          <RoundEditor
            key={round.id}
            round={round}
            index={i}
            total={draft.rounds.length}
            onChange={r => updateRound(i, r)}
            onRemove={() => removeRound(i)}
            onMoveUp={() => moveRound(i, -1)}
            onMoveDown={() => moveRound(i, 1)}
          />
        ))}

        <Button variant="secondary" size="lg" onClick={addRound} className="mt-2">
          + Add Round
        </Button>
      </div>
    </div>
  )
}
