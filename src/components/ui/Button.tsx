import type { ButtonHTMLAttributes, CSSProperties } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'store'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  storeColor?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  storeColor,
  style,
  ...props
}: ButtonProps) {
  const buttonStyle =
    variant === 'store' && storeColor
      ? ({ ...style, '--store-button-color': storeColor } as CSSProperties)
      : style

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`.trim()}
      style={buttonStyle}
      {...props}
    />
  )
}
