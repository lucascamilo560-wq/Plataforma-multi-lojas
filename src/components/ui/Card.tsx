import type { ReactNode } from 'react'

interface CardProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <article className="card">
      <header>
        <h3>{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </header>
      {children}
    </article>
  )
}
