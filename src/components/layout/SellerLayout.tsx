import { Outlet } from 'react-router-dom'
import { AppHeader } from '../ui/AppHeader'

const sellerNavigation = [
  { to: '/lojista', label: 'Painel', icon: 'chart' as const },
  { to: '/lojista/produtos', label: 'Produtos', icon: 'package' as const },
  { to: '/lojista/pedidos', label: 'Pedidos', icon: 'cart' as const },
  { to: '/lojista/promocoes', label: 'Promoções', icon: 'tag' as const },
  { to: '/lojista/minha-loja', label: 'Minha loja', icon: 'storefront' as const },
  { to: '/lojista/minha-vitrine', label: 'Minha vitrine', icon: 'storefront' as const },
  { to: '/lojista/relatorios', label: 'Mais', icon: 'sparkles' as const },
]

export function SellerLayout() {
  return (
    <div className="app-shell">
      <AppHeader
        navigation={sellerNavigation}
        brandKicker="Área do lojista"
        brandTitle="Gerencie sua loja, catálogo, pedidos e relacionamento com clientes"
      />
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}
