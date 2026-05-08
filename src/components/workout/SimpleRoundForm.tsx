import type { SimpleRound } from '@/models/workout'

type Props = {
  round: SimpleRound
  onChange: (round: SimpleRound) => void
}

export const SimpleRoundForm = ({ round, onChange }: Props) => (
  <div className="flex flex-col gap-3">
    <div className="flex gap-2 items-center">
      <label className="text-zinc-400 text-sm w-20 shrink-0">Duration</label>
      <input
        type="number"
        min={10}
        max={3600}
        className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
        value={round.duration}
        onChange={e => onChange({ ...round, duration: Math.max(10, Number(e.target.value)) })}
      />
      <span className="text-zinc-400 text-sm">sec</span>
    </div>
    <div className="flex gap-2 items-center">
      <label className="text-zinc-400 text-sm w-20 shrink-0">Rest after</label>
      <input
        type="number"
        min={0}
        max={600}
        className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
        value={round.restAfter ?? 0}
        onChange={e => onChange({ ...round, restAfter: Number(e.target.value) || undefined })}
      />
      <span className="text-zinc-400 text-sm">sec</span>
    </div>
  </div>
)
