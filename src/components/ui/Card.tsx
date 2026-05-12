import type { CSSProperties, ReactNode } from 'react'

type CardVariant = 'default' | 'accentCorner' | 'layered' | 'actionTile'

interface CardProps {
  title?: string
  subtitle?: string
  children?: ReactNode
  variant?: CardVariant
  accentColor?: string
  className?: string
}

const variantClassMap: Record<CardVariant, string> = {
  default: 'card-default',
  accentCorner: 'card-accent-corner',
  layered: 'card-layered',
  actionTile: 'card-action-tile',
}

export function Card({
  title,
  subtitle,
  children,
  variant = 'default',
  accentColor,
  className = '',
}: CardProps) {
  const inlineStyle =
    accentColor && (variant === 'accentCorner' || variant === 'actionTile')
      ? ({ '--card-accent': accentColor } as CSSProperties)
      : undefined

  return (
    <article className={`card ${variantClassMap[variant]} ${className}`.trim()} style={inlineStyle}>
      {(title || subtitle) && (
        <header className="card-head">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </article>
  )
}
