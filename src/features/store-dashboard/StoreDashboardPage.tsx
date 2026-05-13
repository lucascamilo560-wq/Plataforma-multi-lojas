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
import { buildPublicUrl } from '../../utils/publicUrl'

export function StoreDashboardPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    getStoreOrders(storeId).then(setOrders)
    getProductsByStore(storeId, { includeInactive: true }).then(setProducts)
    getStoreById(storeId).then(setStore)
  }, [storeId])

  const todayStr = new Date().toDateString()
  const ordersToday = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && new Date(o.createdAt).toDateString() === todayStr),
    [orders, todayStr],
  )
  const confirmedRevenue = useMemo(
    () => orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    [orders],
  )
  const pendingRevenue = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            o.status !== 'cancelled' &&
            o.paymentStatus !== 'paid' &&
            o.paymentStatus !== 'refunded' &&
            o.paymentStatus !== 'failed',
        )
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  )
  const storeTheme = getStoreTheme(store)
  const storefrontPath = store?.slug ? `/loja/${store.slug}` : '/cliente/explorar'
  const storefrontUrl = buildPublicUrl(storefrontPath)

  const handleShareStore = async () => {
    try {
      setShareMessage('')
      await window.navigator.clipboard.writeText(storefrontUrl)
      setShareMessage('Link da vitrine copiado para compartilhar.')
    } catch {
      setShareMessage('Não foi possível copiar automaticamente. Use o botão de ver vitrine para abrir o link.')
    }
  }

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
            <div className="stack">
              <strong>{store?.name ?? 'Minha loja'}</strong>
              <Badge variant={store?.isActive ? 'success' : 'muted'}>
                {store?.isActive ? 'Loja ativa' : 'Loja temporariamente pausada'}
              </Badge>
            </div>
          </div>
          <div className="inline-info">
            <Link to={storefrontPath}>
              <Button variant="store" storeColor={storeTheme.primaryColor}>
                Ver minha vitrine
              </Button>
            </Link>
            <Button variant="secondary" onClick={handleShareStore}>
              Compartilhar loja
            </Button>
          </div>
          {shareMessage && <p className="muted">{shareMessage}</p>}
        </div>
      </Card>

      <div className="grid grid-metrics">
        <KpiCard label="Pedidos hoje" value={ordersToday.length} icon="clock" />
        <KpiCard label="Produtos" value={products.length} icon="package" />
        <KpiCard label="Faturamento confirmado" value={formatCurrency(confirmedRevenue)} icon="wallet" />
        <KpiCard label="A receber" value={formatCurrency(pendingRevenue)} icon="tag" />
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
        <ActionTile title="Minha loja" description="Dados e configurações" icon="storefront" to="/lojista/minha-loja" />
        <ActionTile title="Minha vitrine" description="Link, QR Code e prévia" icon="storefront" to="/lojista/minha-vitrine" />
        <ActionTile title="Relatórios" description="Análises da loja" icon="chart" to="/lojista/relatorios" />
        <ActionTile title="Ajuda" description="Suporte e orientações" icon="check" to="/lojista/ajuda" />
      </div>
    </section>
  )
}
