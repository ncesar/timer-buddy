import type { IntervalRound, IntervalBlock } from '@/models/workout'
import { generateId } from '@/utils/id'
import { IntervalBlockEditor } from './IntervalBlockEditor'
import { Button } from '@/components/ui/Button'
import { NumberInput } from '@/components/ui/NumberInput'

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#06b6d4']

type Props = {
  round: IntervalRound
  onChange: (round: IntervalRound) => void
}

export const IntervalRoundForm = ({ round, onChange }: Props) => {
  const addBlock = () => {
    const color = DEFAULT_COLORS[round.blocks.length % DEFAULT_COLORS.length]
    const lastAt = round.blocks[round.blocks.length - 1]?.atSecond ?? -30
    const block: IntervalBlock = { id: generateId(), name: 'Block', atSecond: lastAt + 30, color }
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <label className="text-zinc-400 text-sm w-20 shrink-0">Duration</label>
        <NumberInput
          min={10} max={3600}
          className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
          value={round.duration}
          onChange={n => onChange({ ...round, duration: n })}
        />
        <span className="text-zinc-400 text-sm">sec</span>
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-zinc-400 text-sm w-20 shrink-0">Rest after</label>
        <NumberInput
          min={0} max={600}
          className="w-24 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
          value={round.restAfter ?? 0}
          onChange={n => onChange({ ...round, restAfter: n || undefined })}
        />
        <span className="text-zinc-400 text-sm">sec</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-zinc-300 text-sm font-medium">Blocks</span>
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
