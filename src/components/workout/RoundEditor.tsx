import type { Round, SimpleRound, IntervalRound, InstructionRound } from '@/models/workout'
import { generateId } from '@/utils/id'
import { SimpleRoundForm } from './SimpleRoundForm'
import { IntervalRoundForm } from './IntervalRoundForm'
import { InstructionRoundForm } from './InstructionRoundForm'

type RoundType = Round['type']

const TYPE_LABELS: Record<RoundType, string> = {
  simple: 'Simple',
  interval: 'Interval',
  instruction: 'Voice cues',
}

const makeDefault = (type: RoundType, base: Pick<Round, 'id' | 'name' | 'duration' | 'restAfter'>): Round => {
  if (type === 'simple') return { ...base, type: 'simple' }
  if (type === 'interval') return { ...base, type: 'interval', blocks: [] }
  return { ...base, type: 'instruction', instructions: [] }
}

type Props = {
  round: Round
  index: number
  total: number
  onChange: (round: Round) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export const RoundEditor = ({ round, index, total, onChange, onRemove, onMoveUp, onMoveDown }: Props) => {
  const changeType = (type: RoundType) => {
    if (type === round.type) return
    onChange(makeDefault(type, { id: generateId(), name: round.name, duration: round.duration, restAfter: round.restAfter }))
  }

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={index === 0} className="text-zinc-500 hover:text-white disabled:opacity-20 text-xs leading-none">▲</button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="text-zinc-500 hover:text-white disabled:opacity-20 text-xs leading-none">▼</button>
        </div>
        <span className="text-zinc-500 text-sm w-6 text-center">{index + 1}</span>
        <input
          className="flex-1 bg-zinc-700 rounded-xl px-3 py-2 text-white font-medium outline-none"
          placeholder="Round name"
          value={round.name}
          onChange={e => onChange({ ...round, name: e.target.value })}
        />
        <button onClick={onRemove} className="text-red-400 hover:text-red-300 p-1">✕</button>
      </div>

      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1">
        {(Object.keys(TYPE_LABELS) as RoundType[]).map(t => (
          <button
            key={t}
            onClick={() => changeType(t)}
            className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${
              round.type === t
                ? 'bg-red-600 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {round.type === 'simple' && (
        <SimpleRoundForm round={round as SimpleRound} onChange={r => onChange(r)} />
      )}
      {round.type === 'interval' && (
        <IntervalRoundForm round={round as IntervalRound} onChange={r => onChange(r)} />
      )}
      {round.type === 'instruction' && (
        <InstructionRoundForm round={round as InstructionRound} onChange={r => onChange(r)} />
      )}
    </div>
  )
}
