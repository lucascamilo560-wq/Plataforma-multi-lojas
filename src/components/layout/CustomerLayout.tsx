import { Outlet } from 'react-router-dom'
import { AppHeader } from '../ui/AppHeader'

const customerNavigation = [
  { to: '/cliente', label: 'Início', icon: 'sparkles' as const },
  { to: '/cliente/explorar', label: 'Explorar', icon: 'search' as const },
  { to: '/cliente/carrinho', label: 'Carrinho', icon: 'cart' as const },
  { to: '/cliente/pedidos', label: 'Pedidos', icon: 'clock' as const },
  { to: '/cliente/perfil', label: 'Perfil', icon: 'user' as const },
]

export function CustomerLayout() {
  return (
    <div className="app-shell">
      <AppHeader
        navigation={customerNavigation}
        brandKicker="Área do cliente"
        brandTitle="Descubra lojas locais e faça seus pedidos com facilidade"
      />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
