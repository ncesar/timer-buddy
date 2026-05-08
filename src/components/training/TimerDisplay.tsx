import { formatTime } from '@/utils/time'

type Props = {
  remaining: number
  isRest?: boolean
}

export const TimerDisplay = ({ remaining, isRest = false }: Props) => (
  <div className="flex flex-col items-center">
    {isRest && (
      <span className="text-zinc-400 text-lg font-semibold tracking-widest uppercase mb-1">Rest</span>
    )}
    <span
      className={`font-mono tabular-nums font-black leading-none select-none ${
        remaining <= 10 && !isRest ? 'text-red-500' : 'text-white'
      }`}
      style={{ fontSize: 'clamp(5rem, 25vw, 10rem)' }}
    >
      {formatTime(remaining)}
    </span>
  </div>
)
