import type { SimpleRound } from '@/models/workout'
import { NumberInput } from '@/components/ui/NumberInput'

type Props = {
  round: SimpleRound
  onChange: (round: SimpleRound) => void
}

export const SimpleRoundForm = ({ round, onChange }: Props) => (
  <div className="flex flex-col gap-3">
    <div className="flex gap-2 items-center">
      <label className="text-zinc-400 text-sm w-20 shrink-0">Duration</label>
      <NumberInput
        min={10}
        max={3600}
        className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
        value={round.duration}
        onChange={n => onChange({ ...round, duration: n })}
      />
      <span className="text-zinc-400 text-sm">sec</span>
    </div>
    <div className="flex gap-2 items-center">
      <label className="text-zinc-400 text-sm w-20 shrink-0">Rest after</label>
      <NumberInput
        min={0}
        max={600}
        className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
        value={round.restAfter ?? 0}
        onChange={n => onChange({ ...round, restAfter: n || undefined })}
      />
      <span className="text-zinc-400 text-sm">sec</span>
    </div>
  </div>
)
