import { NavLink } from 'react-router-dom'

interface TabItem {
  key: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Seletor em abas">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`tab-button ${item.key === activeKey ? 'tab-button-active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

interface NavPill {
  to: string
  label: string
}

interface NavPillsProps {
  items: NavPill[]
}

export function NavPills({ items }: NavPillsProps) {
  return (
    <nav className="top-nav" aria-label="Navegação principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `tab-pill ${isActive ? 'tab-pill-active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
