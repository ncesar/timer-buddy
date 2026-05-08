import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { useTraining } from '@/hooks/useTraining'
import { TimerDisplay } from '@/components/training/TimerDisplay'
import { BlockDisplay } from '@/components/training/BlockDisplay'
import { RoundProgress } from '@/components/training/RoundProgress'
import { TrainingControls } from '@/components/training/TrainingControls'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export const TrainingPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { workouts } = useWorkoutStore()
  const store = useTrainingStore()
  const { startTraining, pauseTraining, resumeTraining, skipRound, stopTraining } = useTraining()

  const [started, setStarted] = useState(false)
  const [showStop, setShowStop] = useState(false)

  const workout = workouts.find(w => w.id === id)

  // Lock screen orientation to portrait on training
  useEffect(() => {
    ;(screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })
      ?.lock?.('portrait').catch(() => {/* ignore */})
    return () => { screen.orientation?.unlock() }
  }, [])

  const handleStart = () => {
    if (!workout) return
    setStarted(true)
    startTraining(workout)
  }

  const handleStop = () => {
    stopTraining()
    navigate('/')
  }

  const handleStopRequest = () => {
    if (store.status === 'running' || store.status === 'paused' || store.status === 'rest') {
      setShowStop(true)
    } else {
      navigate('/')
    }
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Workout not found</p>
          <Button onClick={() => navigate('/')}>Go home</Button>
        </div>
      </div>
    )
  }

  const currentRound = store.currentRound
  const roundsTotal = workout.rounds.length
  const elapsed = store.elapsed
  const remaining = currentRound ? Math.max(0, currentRound.duration - elapsed) : 0
  const restRemaining = store.status === 'rest'
    ? Math.max(0, (currentRound?.restAfter ?? 0) - store.restElapsed)
    : 0

  return (
    <div className="training-screen min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Pre-start overlay */}
      {!started && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-2">{workout.name}</h1>
            <p className="text-zinc-400">{roundsTotal} round{roundsTotal !== 1 ? 's' : ''}</p>
          </div>
          <Button variant="primary" size="xl" onClick={handleStart} className="w-48 h-24 rounded-full text-3xl">
            ▶
          </Button>
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white text-sm">
            ← Back
          </button>
        </div>
      )}

      {/* Active training */}
      {started && store.status !== 'idle' && (
        <>
          <div className="flex-1 flex flex-col items-center justify-between py-8 px-4">
            <RoundProgress
              current={store.currentRoundIndex + 1}
              total={roundsTotal}
              roundName={currentRound?.name ?? ''}
            />

            <div className="flex flex-col items-center gap-4 w-full">
              {store.status === 'rest' ? (
                <TimerDisplay remaining={restRemaining} isRest />
              ) : (
                <TimerDisplay remaining={remaining} />
              )}

              {currentRound?.type === 'interval' && store.currentBlock && (
                <BlockDisplay block={store.currentBlock} />
              )}

              {currentRound?.type === 'instruction' && (
                <div className="text-zinc-500 text-sm uppercase tracking-widest">Voice cues active</div>
              )}
            </div>

            <TrainingControls
              status={store.status}
              onPause={pauseTraining}
              onResume={resumeTraining}
              onSkip={skipRound}
              onStop={handleStopRequest}
            />
          </div>
        </>
      )}

      {/* Completed */}
      {store.status === 'completed' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <span className="text-6xl">🥊</span>
          <h2 className="text-3xl font-black">Done!</h2>
          <p className="text-zinc-400">{workout.name} complete</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/')} className="mt-4">
            Back to workouts
          </Button>
        </div>
      )}

      {/* Stop confirmation */}
      <Modal open={showStop} onClose={() => setShowStop(false)} title="Stop training?">
        <p className="text-zinc-400 mb-6">Your progress will be lost.</p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => setShowStop(false)} className="flex-1">
            Continue
          </Button>
          <Button variant="danger" size="md" onClick={handleStop} className="flex-1">
            Stop
          </Button>
        </div>
      </Modal>
    </div>
  )
}
