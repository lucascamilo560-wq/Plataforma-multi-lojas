import { Outlet } from 'react-router-dom'
import { AppHeader } from '../ui/AppHeader'

const navigation = [
  { to: '/', label: 'Início', icon: 'sparkles' as const },
  { to: '/stores', label: 'Lojas', icon: 'storefront' as const },
  { to: '/cart', label: 'Carrinho', icon: 'cart' as const },
  { to: '/dashboard', label: 'Painel', icon: 'chart' as const },
  { to: '/admin', label: 'Admin', icon: 'shield' as const },
]

export function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader navigation={navigation} />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
