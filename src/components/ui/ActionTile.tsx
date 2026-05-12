import { Link } from 'react-router-dom'
import { Card } from './Card'
import { Icon } from './Icon'

interface ActionTileProps {
  title: string
  description: string
  icon: Parameters<typeof Icon>[0]['name']
  to: string
  active?: boolean
  accentColor?: string
}

export function ActionTile({ title, description, icon, to, active = false, accentColor }: ActionTileProps) {
  return (
    <Link to={to} className="action-tile-link" aria-current={active ? 'page' : undefined}>
      <Card variant="actionTile" accentColor={accentColor} className={active ? 'action-tile-active' : ''}>
        <div className="action-tile-icon">
          <Icon name={icon} className="icon-md" />
        </div>
        <div>
          <p className="action-tile-title">{title}</p>
          <p className="action-tile-description">{description}</p>
        </div>
      </Card>
    </Link>
  )
}
