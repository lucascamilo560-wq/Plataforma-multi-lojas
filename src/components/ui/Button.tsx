import type { ButtonHTMLAttributes, CSSProperties } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'store'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  storeColor?: string
}

export function Button({
  variant = 'primary',
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
      className={`btn btn-${variant} ${className}`.trim()}
      style={buttonStyle}
      {...props}
    />
  )
}
