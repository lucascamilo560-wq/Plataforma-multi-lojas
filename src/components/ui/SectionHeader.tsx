import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface SectionHeaderProps {
  title: string
  description: string
  kicker?: string
  icon?: Parameters<typeof Icon>[0]['name']
  actions?: ReactNode
}

export function SectionHeader({ title, description, kicker, icon, actions }: SectionHeaderProps) {
  return (
    <header className="section-header">
      {kicker && <p className="section-kicker">{kicker}</p>}
      <div className="section-title-row">
        {icon && <Icon name={icon} className="section-icon" />}
        <h2 className="section-title">{title}</h2>
      </div>
      <p className="section-description">{description}</p>
      {actions}
    </header>
  )
}
