import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionTile } from '../../components/ui/ActionTile'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { KpiCard } from '../../components/ui/KpiCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getProductsByStore, getStoreById, getStoreOrders } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StoreDashboardPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()

  useEffect(() => {
    getStoreOrders(storeId).then(setOrders)
    getProductsByStore(storeId).then(setProducts)
    getStoreById(storeId).then(setStore)
  }, [storeId])

  const revenue = useMemo(() => orders.reduce((amount, order) => amount + order.total, 0), [orders])
  const storeTheme = getStoreTheme(store)
  const storeSlug = store?.slug ?? ''

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Painel do lojista"
        icon="chart"
        title={store?.name ? `Painel da loja ${store.name}` : 'Painel da sua loja'}
        description="Acompanhe suas vendas, produtos e pedidos em tempo real."
      />

      <Card
        variant="accentCorner"
        accentColor={storeTheme.accentColor}
        title={store?.name ?? 'Minha loja'}
        subtitle="Resumo da sua operação"
      >
        <div className="inline-info">
          <div className="inline-info">
            {storeTheme.logoUrl && (
              <img
                src={storeTheme.logoUrl}
                alt={`Logo da loja ${store?.name ?? 'Minha loja'}`}
                className="store-logo"
              />
            )}
            <div className="stack" style={{ gap: '0.3rem' }}>
              <strong>{store?.name ?? 'Minha loja'}</strong>
              <Badge variant={store?.isActive ? 'success' : 'muted'}>
                {store?.isActive ? 'Loja ativa' : 'Loja temporariamente pausada'}
              </Badge>
            </div>
          </div>
          <div className="inline-info">
            <Link to={storeSlug ? `/cliente/loja/${storeSlug}` : '/cliente/explorar'}>
              <Button variant="store" storeColor={storeTheme.primaryColor}>
                Ver minha vitrine
              </Button>
            </Link>
            <Link to={storeSlug ? `/cliente/loja/${storeSlug}` : '/cliente/explorar'}>
              <Button variant="secondary">Compartilhar loja</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-metrics">
        <KpiCard label="Pedidos" value={orders.length} icon="clock" />
        <KpiCard label="Produtos" value={products.length} icon="package" />
        <KpiCard label="Vendas" value={formatCurrency(revenue)} icon="wallet" />
        <KpiCard
          label="Ticket médio"
          value={formatCurrency(revenue / Math.max(orders.length, 1))}
          icon="tag"
        />
      </div>

      <SectionHeader
        kicker="Atalhos"
        icon="sparkles"
        title="Ferramentas da sua loja"
        description="Acesse as áreas que você usa no dia a dia para vender mais."
      />

      <div className="grid grid-tiles">
        <ActionTile title="Produtos" description="Gerencie catálogo" icon="package" to="/lojista/produtos" />
        <ActionTile title="Pedidos" description="Acompanhe entregas" icon="cart" to="/lojista/pedidos" />
        <ActionTile title="Promoções" description="Crie campanhas" icon="tag" to="/lojista/promocoes" />
        <ActionTile title="Cupons" description="Controle descontos" icon="tag" to="/lojista/cupons" />
        <ActionTile title="Clientes" description="Veja sua base" icon="user" to="/lojista/clientes" />
        <ActionTile title="Pagamentos" description="Formas aceitas" icon="wallet" to="/lojista/pagamentos" />
        <ActionTile title="Entrega/Retirada" description="Defina logística" icon="clock" to="/lojista/entrega" />
        <ActionTile title="Minha marca" description="Visual da loja" icon="palette" to="/lojista/marca" />
        <ActionTile title="Relatórios" description="Análises da loja" icon="chart" to="/lojista/relatorios" />
        <ActionTile title="Ajuda" description="Suporte e orientações" icon="check" to="/lojista/minha-loja" />
      </div>

      <Card title="Visualização" subtitle="Veja sua vitrine sem entrar no fluxo de compra" variant="layered">
        <Link to={storeSlug ? `/cliente/loja/${storeSlug}` : '/cliente/explorar'}>
          <Button variant="secondary">Ver minha vitrine como cliente</Button>
        </Link>
      </Card>
    </section>
  )
}
