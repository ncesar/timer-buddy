import { useState, useEffect } from 'react'

type Props = {
  value: number
  min?: number
  max?: number
  onChange: (n: number) => void
  className?: string
}

export const NumberInput = ({ value, min, max, onChange, className }: Props) => {
  const [raw, setRaw] = useState(String(value))

  useEffect(() => {
    setRaw(String(value))
  }, [value])

  const clamp = (n: number) => {
    let v = n
    if (min !== undefined) v = Math.max(min, v)
    if (max !== undefined) v = Math.min(max, v)
    return v
  }

  return (
    <input
      inputMode="numeric"
      className={className}
      value={raw}
      onChange={e => {
        const s = e.target.value.replace(/[^0-9]/g, '')
        setRaw(s)
        const n = parseInt(s, 10)
        if (!isNaN(n)) onChange(clamp(n))
      }}
      onBlur={() => {
        const n = parseInt(raw, 10)
        const clamped = clamp(isNaN(n) ? (min ?? 0) : n)
        setRaw(String(clamped))
        onChange(clamped)
      }}
    />
  )
}
