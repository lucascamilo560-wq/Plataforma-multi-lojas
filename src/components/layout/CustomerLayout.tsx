import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { APP_BRAND } from '../../config/brand'
import { AppHeader } from '../ui/AppHeader'

export function CustomerLayout() {
  const customerNavigation = useMemo(() => [
    { to: '/cliente', label: 'Início', icon: 'hub' as const },
    { to: '/cliente/minhas-lojas', label: 'Minhas lojas', icon: 'storefront' as const },
    { to: '/cliente/pedidos', label: 'Pedidos', icon: 'clock' as const },
    { to: '/cliente/perfil', label: 'Perfil', icon: 'user' as const },
  ], [])

  return (
    <div className="app-shell">
      <AppHeader
        navigation={customerNavigation}
        brandKicker={APP_BRAND.customerKicker}
        brandTitle="Suas lojas por convite, pedidos e vitrines em um só lugar."
      />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
