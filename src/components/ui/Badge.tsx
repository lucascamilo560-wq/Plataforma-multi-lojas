import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'muted' | 'danger'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return <span className={`badge badge-${variant} ${className}`.trim()}>{children}</span>
}
