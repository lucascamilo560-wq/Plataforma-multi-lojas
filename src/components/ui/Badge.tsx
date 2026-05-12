import type { CSSProperties, ReactNode } from 'react'

type BadgeVariant = 'success' | 'muted' | 'danger' | 'accent' | 'store'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  storeColor?: string
}

export function Badge({ children, variant = 'muted', className = '', storeColor }: BadgeProps) {
  const badgeStyle =
    variant === 'store' && storeColor
      ? ({ '--store-badge-color': storeColor } as CSSProperties)
      : undefined

  return (
    <span className={`badge badge-${variant} ${className}`.trim()} style={badgeStyle}>
      {children}
    </span>
  )
}
