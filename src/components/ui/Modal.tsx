import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export const Modal = ({ open, onClose, children, title }: Props) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) el.showModal()
    else el.close()
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleClose = () => onClose()
    el.addEventListener('close', handleClose)
    return () => el.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      className="bg-zinc-900 text-white rounded-2xl p-6 w-full max-w-sm mx-auto backdrop:bg-black/70 outline-none"
      onClick={e => { if (e.target === ref.current) ref.current?.close() }}
    >
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {children}
    </dialog>
  )
}
