import type { IntervalBlock } from '@/models/workout'
import { NumberInput } from '@/components/ui/NumberInput'

const COLORS = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
]

type Props = {
  block: IntervalBlock
  onChange: (block: IntervalBlock) => void
  onRemove: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  loopMode?: boolean
}

export const IntervalBlockEditor = ({ block, onChange, onRemove, canMoveUp, canMoveDown, onMoveUp, onMoveDown, loopMode = false }: Props) => (
  <div className="bg-zinc-800 rounded-xl p-3 flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: block.color }} />
      <input
        className="flex-1 bg-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
        placeholder="Block name"
        value={block.name}
        onChange={e => {
          const name = e.target.value
          const voiceFollowsName = !block.voiceCommand || block.voiceCommand === block.name
          onChange({ ...block, name, voiceCommand: voiceFollowsName ? name || undefined : block.voiceCommand })
        }}
      />
      <div className="flex gap-1">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
          aria-label="Move up"
        >↑</button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
          aria-label="Move down"
        >↓</button>
        <button
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-300"
          aria-label="Remove"
        >✕</button>
      </div>
    </div>
    {loopMode ? (
      <div className="flex gap-2 items-center">
        <label className="text-zinc-400 text-xs">Duration</label>
        <NumberInput
          min={1}
          max={600}
          className="w-16 bg-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none"
          value={block.duration ?? 10}
          onChange={n => onChange({ ...block, duration: n })}
        />
        <span className="text-zinc-400 text-xs">sec</span>
      </div>
    ) : (
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2 items-center">
          <label className="text-zinc-400 text-xs">At second</label>
          <NumberInput
            min={0}
            max={9999}
            className="w-16 bg-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none"
            value={block.atSecond}
            onChange={n => onChange({ ...block, atSecond: n })}
          />
        </div>
        <label className="flex gap-2 items-center cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={block.repeat ?? false}
            onChange={e => onChange({ ...block, repeat: e.target.checked })}
          />
          <span className="text-zinc-400 text-xs">Repeat every</span>
          {block.repeat && (
            <>
              <NumberInput
                min={1}
                max={999}
                className="w-14 bg-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none"
                value={block.repeatInterval ?? 30}
                onChange={n => onChange({ ...block, repeatInterval: n })}
              />
              <span className="text-zinc-400 text-xs">sec</span>
            </>
          )}
        </label>
      </div>
    )}
    <div className="flex gap-2 items-center">
      <label className="text-zinc-400 text-xs w-14">Color</label>
      <div className="flex gap-1 flex-wrap">
        {COLORS.map(c => (
          <button
            key={c.value}
            title={c.label}
            onClick={() => onChange({ ...block, color: c.value })}
            className={`w-5 h-5 rounded-full border-2 ${block.color === c.value ? 'border-white' : 'border-transparent'}`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
    <div className="flex gap-2 items-center">
      <label className="text-zinc-400 text-xs w-14">Voice</label>
      <input
        className="flex-1 bg-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none"
        placeholder="e.g. Jabs"
        value={block.voiceCommand ?? ''}
        onChange={e => onChange({ ...block, voiceCommand: e.target.value || undefined })}
      />
    </div>
  </div>
)
