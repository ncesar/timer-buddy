type Props = {
  current: number
  total: number
  roundName: string
}

export const RoundProgress = ({ current, total, roundName }: Props) => (
  <div className="flex flex-col items-center gap-2">
    <div className="text-zinc-300 font-semibold text-xl tracking-wide">
      Round <span className="text-white font-black">{current}</span>
      <span className="text-zinc-500"> / {total}</span>
    </div>
    {roundName && (
      <span className="text-zinc-400 text-sm uppercase tracking-widest">{roundName}</span>
    )}
    <div className="flex gap-1.5 mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < current - 1
              ? 'bg-zinc-600 w-3'
              : i === current - 1
              ? 'bg-red-500 w-5'
              : 'bg-zinc-700 w-3'
          }`}
        />
      ))}
    </div>
  </div>
)
