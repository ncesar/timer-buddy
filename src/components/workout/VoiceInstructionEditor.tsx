import type { VoiceInstruction } from '@/models/workout'
import { NumberInput } from '@/components/ui/NumberInput'

type Props = {
  instruction: VoiceInstruction
  onChange: (inst: VoiceInstruction) => void
  onRemove: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

export const VoiceInstructionEditor = ({ instruction, onChange, onRemove, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: Props) => (
  <div className="bg-zinc-800 rounded-xl p-3 flex flex-col gap-2">
    <div className="flex gap-2 items-start">
      <input
        className="flex-1 bg-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
        placeholder="Say something..."
        value={instruction.text}
        onChange={e => onChange({ ...instruction, text: e.target.value })}
      />
      <div className="flex gap-1 shrink-0">
        <button onClick={onMoveUp} disabled={!canMoveUp} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30">↑</button>
        <button onClick={onMoveDown} disabled={!canMoveDown} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30">↓</button>
        <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-300">✕</button>
      </div>
    </div>
    <div className="flex gap-3 flex-wrap">
      <div className="flex gap-2 items-center">
        <label className="text-zinc-400 text-xs">At second</label>
        <NumberInput
          min={0}
          max={9999}
          className="w-16 bg-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none"
          value={instruction.atSecond}
          onChange={n => onChange({ ...instruction, atSecond: n })}
        />
      </div>
      <label className="flex gap-2 items-center cursor-pointer">
        <input
          type="checkbox"
          className="rounded"
          checked={instruction.repeat ?? false}
          onChange={e => onChange({ ...instruction, repeat: e.target.checked })}
        />
        <span className="text-zinc-400 text-xs">Repeat every</span>
        {instruction.repeat && (
          <>
            <NumberInput
              min={1}
              max={999}
              className="w-14 bg-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none"
              value={instruction.repeatInterval ?? 30}
              onChange={n => onChange({ ...instruction, repeatInterval: n })}
            />
            <span className="text-zinc-400 text-xs">sec</span>
          </>
        )}
      </label>
    </div>
  </div>
)
