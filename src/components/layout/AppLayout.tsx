import { Outlet } from 'react-router-dom'
import { AppHeader } from '../ui/AppHeader'

const navigation = [
  { to: '/cliente', label: 'Início', icon: 'sparkles' as const },
]

export function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader
        navigation={navigation}
        brandKicker="Plataforma"
        brandTitle="Experiência digital para lojas locais"
      />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
