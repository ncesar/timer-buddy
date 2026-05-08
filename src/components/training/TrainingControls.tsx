import type { TrainingStatus } from '@/store/trainingStore'
import { Button } from '@/components/ui/Button'

type Props = {
  status: TrainingStatus
  onPause: () => void
  onResume: () => void
  onSkip: () => void
  onStop: () => void
}

export const TrainingControls = ({ status, onPause, onResume, onSkip, onStop }: Props) => (
  <div className="flex gap-4 items-center justify-center">
    <Button
      variant="ghost"
      size="lg"
      onClick={onStop}
      className="text-zinc-500 hover:text-red-400 w-14 h-14 flex items-center justify-center text-2xl"
      aria-label="Stop"
    >
      ■
    </Button>

    <Button
      variant="primary"
      size="xl"
      onClick={status === 'running' || status === 'rest' ? onPause : onResume}
      className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
      aria-label={status === 'running' || status === 'rest' ? 'Pause' : 'Resume'}
    >
      {status === 'running' || status === 'rest' ? '⏸' : '▶'}
    </Button>

    <Button
      variant="ghost"
      size="lg"
      onClick={onSkip}
      disabled={status === 'completed' || status === 'idle'}
      className="text-zinc-500 hover:text-white w-14 h-14 flex items-center justify-center text-2xl"
      aria-label="Skip"
    >
      ⏭
    </Button>
  </div>
)
