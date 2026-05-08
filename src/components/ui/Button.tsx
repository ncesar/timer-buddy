import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  secondary: 'bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white',
  danger: 'bg-red-900 hover:bg-red-800 active:bg-red-700 text-red-200',
  ghost: 'bg-transparent hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-2xl',
  xl: 'px-8 py-5 text-2xl rounded-2xl',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: Props) => (
  <button
    {...props}
    className={`font-semibold transition-colors select-none ${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)
