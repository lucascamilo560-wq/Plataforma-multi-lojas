import { NavLink } from 'react-router-dom'
import { Button } from './Button'
import { Icon } from './Icon'
import { NavPills } from './Tabs'

interface HeaderNavItem {
  to: string
  label: string
  icon: Parameters<typeof Icon>[0]['name']
}

interface AppHeaderProps {
  navigation: HeaderNavItem[]
}

export function AppHeader({ navigation }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <p className="brand-kicker">Plataforma Multi-lojas</p>
            <h1 className="brand-title">Hub comercial para vender mais todos os dias</h1>
          </div>
          <NavLink to="/login">
            <Button variant="secondary" className="header-login">
              <Icon name="user" className="icon-sm" />
              Entrar
            </Button>
          </NavLink>
        </div>
        <NavPills items={navigation} />
      </div>
    </header>
  )
}
