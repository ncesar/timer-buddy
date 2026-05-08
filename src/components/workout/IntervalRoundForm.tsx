import type { IntervalRound, IntervalBlock } from '@/models/workout'
import { generateId } from '@/utils/id'
import { IntervalBlockEditor } from './IntervalBlockEditor'
import { Button } from '@/components/ui/Button'

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#06b6d4']

type Props = {
  round: IntervalRound
  onChange: (round: IntervalRound) => void
}

export const IntervalRoundForm = ({ round, onChange }: Props) => {
  const addBlock = () => {
    const color = DEFAULT_COLORS[round.blocks.length % DEFAULT_COLORS.length]
    const block: IntervalBlock = { id: generateId(), name: 'Block', duration: 30, color }
    onChange({ ...round, blocks: [...round.blocks, block] })
  }

  const updateBlock = (i: number, block: IntervalBlock) => {
    const blocks = [...round.blocks]
    blocks[i] = block
    onChange({ ...round, blocks })
  }

  const removeBlock = (i: number) => {
    onChange({ ...round, blocks: round.blocks.filter((_, idx) => idx !== i) })
  }

  const moveBlock = (i: number, dir: -1 | 1) => {
    const blocks = [...round.blocks]
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    onChange({ ...round, blocks })
  }

  const totalCycleDuration = round.blocks.reduce((s, b) => s + b.duration, 0)
  const cycles = totalCycleDuration > 0 ? Math.floor(round.duration / totalCycleDuration) : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <label className="text-zinc-400 text-sm w-20 shrink-0">Duration</label>
        <input
          type="number" min={10} max={3600}
          className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
          value={round.duration}
          onChange={e => onChange({ ...round, duration: Math.max(10, Number(e.target.value)) })}
        />
        <span className="text-zinc-400 text-sm">sec</span>
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-zinc-400 text-sm w-20 shrink-0">Rest after</label>
        <input
          type="number" min={0} max={600}
          className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
          value={round.restAfter ?? 0}
          onChange={e => onChange({ ...round, restAfter: Number(e.target.value) || undefined })}
        />
        <span className="text-zinc-400 text-sm">sec</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-zinc-300 text-sm font-medium">Blocks</span>
          {totalCycleDuration > 0 && (
            <span className="text-zinc-500 text-xs">{cycles} cycle{cycles !== 1 ? 's' : ''} × {totalCycleDuration}s</span>
          )}
        </div>
        {round.blocks.map((block, i) => (
          <IntervalBlockEditor
            key={block.id}
            block={block}
            onChange={b => updateBlock(i, b)}
            onRemove={() => removeBlock(i)}
            canMoveUp={i > 0}
            canMoveDown={i < round.blocks.length - 1}
            onMoveUp={() => moveBlock(i, -1)}
            onMoveDown={() => moveBlock(i, 1)}
          />
        ))}
        <Button variant="ghost" size="sm" onClick={addBlock} className="self-start">
          + Add block
        </Button>
      </div>
    </div>
  )
}
