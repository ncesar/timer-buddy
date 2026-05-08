import type { IntervalBlock } from '@/models/workout'

type Props = {
  block: IntervalBlock | null
}

export const BlockDisplay = ({ block }: Props) => {
  if (!block) return null
  return (
    <div
      className="rounded-2xl px-6 py-3 text-center transition-colors duration-300"
      style={{ backgroundColor: block.color + '33', borderColor: block.color, borderWidth: 2 }}
    >
      <span
        className="font-bold text-2xl uppercase tracking-wide"
        style={{ color: block.color }}
      >
        {block.name}
      </span>
    </div>
  )
}
