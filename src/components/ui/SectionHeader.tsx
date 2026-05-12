import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description: string
  kicker?: string
  actions?: ReactNode
}

export function SectionHeader({ title, description, kicker, actions }: SectionHeaderProps) {
  return (
    <header className="section-header">
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
      {actions}
    </header>
  )
}
