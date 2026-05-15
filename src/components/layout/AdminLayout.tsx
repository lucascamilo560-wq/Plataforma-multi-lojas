import { Outlet } from 'react-router-dom'
import { APP_BRAND } from '../../config/brand'
import { AppHeader } from '../ui/AppHeader'

const adminNavigation = [
  { to: '/admin', label: 'Dashboard', icon: 'chart' as const },
  { to: '/admin/lojas', label: 'Lojas', icon: 'storefront' as const },
  { to: '/admin/lojistas', label: 'Usuários', icon: 'user' as const },
  { to: '/admin/planos', label: 'Financeiro', icon: 'wallet' as const },
  { to: '/admin/suporte', label: 'Suporte', icon: 'check' as const },
  { to: '/admin/configuracoes', label: 'Configurações', icon: 'shield' as const },
]

export function AdminLayout() {
  return (
    <div className="app-shell">
      <AppHeader
        navigation={adminNavigation}
        brandKicker={APP_BRAND.adminKicker}
        brandTitle="Operação, lojas e crescimento da plataforma em uma visão central."
      />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
