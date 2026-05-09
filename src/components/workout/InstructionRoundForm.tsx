import type { InstructionRound, VoiceInstruction } from '@/models/workout'
import { generateId } from '@/utils/id'
import { VoiceInstructionEditor } from './VoiceInstructionEditor'
import { Button } from '@/components/ui/Button'
import { NumberInput } from '@/components/ui/NumberInput'

type Props = {
  round: InstructionRound
  onChange: (round: InstructionRound) => void
}

export const InstructionRoundForm = ({ round, onChange }: Props) => {
  const addInstruction = () => {
    const lastAt = round.instructions[round.instructions.length - 1]?.atSecond ?? -15
    const inst: VoiceInstruction = { id: generateId(), atSecond: lastAt + 15, text: '' }
    onChange({ ...round, instructions: [...round.instructions, inst] })
  }

  const updateInstruction = (i: number, inst: VoiceInstruction) => {
    const instructions = [...round.instructions]
    instructions[i] = inst
    onChange({ ...round, instructions })
  }

  const removeInstruction = (i: number) => {
    onChange({ ...round, instructions: round.instructions.filter((_, idx) => idx !== i) })
  }

  const moveInstruction = (i: number, dir: -1 | 1) => {
    const instructions = [...round.instructions]
    const j = i + dir
    if (j < 0 || j >= instructions.length) return
    ;[instructions[i], instructions[j]] = [instructions[j], instructions[i]]
    onChange({ ...round, instructions })
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
        <span className="text-zinc-300 text-sm font-medium">Voice cues</span>
        {round.instructions.map((inst, i) => (
          <VoiceInstructionEditor
            key={inst.id}
            instruction={inst}
            onChange={v => updateInstruction(i, v)}
            onRemove={() => removeInstruction(i)}
            canMoveUp={i > 0}
            canMoveDown={i < round.instructions.length - 1}
            onMoveUp={() => moveInstruction(i, -1)}
            onMoveDown={() => moveInstruction(i, 1)}
          />
        ))}
        <Button variant="ghost" size="sm" onClick={addInstruction} className="self-start">
          + Add voice cue
        </Button>
      </div>
    </div>
  )
}
