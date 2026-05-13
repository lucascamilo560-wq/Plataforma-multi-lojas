import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getActiveStore } from '../../services/mockData'
import type { Store } from '../../types'
import { AppHeader } from '../ui/AppHeader'

export function CustomerLayout() {
  const [activeStore, setActiveStore] = useState<Store | null>(null)

  useEffect(() => {
    getActiveStore().then(setActiveStore)
  }, [])

  const customerNavigation = useMemo(() => {
    if (activeStore) {
      return [
        { to: `/loja/${activeStore.slug}`, label: 'Loja', icon: 'storefront' as const },
        { to: `/loja/${activeStore.slug}?tab=ofertas`, label: 'Ofertas', icon: 'tag' as const },
        { to: `/loja/${activeStore.slug}/carrinho`, label: 'Carrinho', icon: 'cart' as const },
        { to: '/cliente/pedidos', label: 'Pedidos', icon: 'clock' as const },
        { to: '/cliente/perfil', label: 'Perfil', icon: 'user' as const },
      ]
    }

    return [
      { to: '/cliente', label: 'Início', icon: 'sparkles' as const },
      { to: '/cliente/minhas-lojas', label: 'Minhas lojas', icon: 'storefront' as const },
      { to: '/cliente/pedidos', label: 'Pedidos', icon: 'clock' as const },
      { to: '/cliente/perfil', label: 'Perfil', icon: 'user' as const },
    ]
  }, [activeStore])

  return (
    <div className="app-shell">
      <AppHeader
        navigation={customerNavigation}
        brandKicker={activeStore ? 'Loja salva' : 'Cliente'}
        brandTitle={
          activeStore
            ? `Você está comprando em ${activeStore.name}`
            : 'Suas lojas e pedidos em um só lugar'
        }
        brandLogoUrl={activeStore?.logoUrl}
      />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
