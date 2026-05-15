import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ActionTile } from '../../components/ui/ActionTile'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { KpiCard } from '../../components/ui/KpiCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getProductsByStore, getSellerOnboardingStatus, getStoreById, getStoreCustomers, getStoreOrders, getStoreReviewSummary } from '../../services/mockData'
import type { CustomerSummary, SellerOnboardingStatus, StoreReviewSummary } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { buildPublicUrl } from '../../utils/publicUrl'
import { SellerOnboardingChecklist } from './SellerOnboardingChecklist'

export function StoreDashboardPage() {
  const { storeId } = useMockSession()
  const location = useLocation()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [shareMessage, setShareMessage] = useState('')
  const [onboardingStatus, setOnboardingStatus] = useState<SellerOnboardingStatus | undefined>()
  const [reviewSummary, setReviewSummary] = useState<StoreReviewSummary | undefined>()

  const justCreated = (location.state as { justCreated?: boolean } | null)?.justCreated === true

  useEffect(() => {
    getStoreOrders(storeId).then(setOrders)
    getProductsByStore(storeId, { includeInactive: true }).then(setProducts)
    getStoreById(storeId).then(setStore)
    getStoreCustomers(storeId).then(setCustomers)
    getSellerOnboardingStatus(storeId).then(setOnboardingStatus)
    getStoreReviewSummary(storeId).then(setReviewSummary)
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
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders])
  const toBeArrangedPayments = useMemo(() => orders.filter((o) => o.paymentStatus === 'to_be_arranged').length, [orders])

  const uniqueCustomers = customers.length
  const recurringCustomers = useMemo(() => customers.filter((c) => c.totalOrders >= 2).length, [customers])
  const averageTicket = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid')
    if (paidOrders.length === 0) return 0
    return paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length
  }, [orders])
  const topCustomer = useMemo(() => {
    if (customers.length === 0) return null
    return customers.reduce((best, c) => (c.totalSpent > best.totalSpent ? c : best))
  }, [customers])

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

      {/* Store header card with gradient based on store theme */}
      <article
        className="card card-default seller-store-header"
        style={{
          background: `linear-gradient(135deg, ${storeTheme.primaryColor} 0%, ${storeTheme.accentColor}aa 100%)`,
          color: '#fff',
          border: 'none',
        }}
      >
        {storeTheme.coverUrl && (
          <div
            className="seller-store-header-bg"
            style={{ backgroundImage: `url(${storeTheme.coverUrl})` }}
          />
        )}
        <div className="seller-store-header-content">
          <div className="inline-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {storeTheme.logoUrl && (
                <img
                  src={storeTheme.logoUrl}
                  alt={`Logo da loja ${store?.name ?? 'Minha loja'}`}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    border: '2px solid rgba(255,255,255,0.5)',
                    objectFit: 'cover',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                />
              )}
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{store?.name ?? 'Minha loja'}</h2>
                <div style={{ marginTop: '0.25rem' }}>
                  <Badge variant={store?.isActive ? 'success' : 'muted'}>
                    {store?.isActive ? 'Loja ativa' : 'Loja pausada'}
                  </Badge>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <Link to={storefrontPath}>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ background: 'rgba(255,255,255,0.9)', color: storeTheme.primaryColor } as React.CSSProperties}
                >
                  Ver vitrine
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareStore}
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' } as React.CSSProperties}
              >
                Compartilhar
              </Button>
            </div>
          </div>
          {shareMessage && (
            <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.88 }}>{shareMessage}</p>
          )}
        </div>
      </article>

      {/* Onboarding checklist */}
      {justCreated && (
        <article
          className="card card-default"
          style={{
            background: 'color-mix(in srgb, var(--accent-violet) 8%, var(--surface))',
            border: '1px solid color-mix(in srgb, var(--accent-violet) 25%, transparent)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-violet)', fontSize: '0.96rem' }}>
            🎉 Loja criada! Agora complete sua configuração para começar a vender.
          </p>
        </article>
      )}

      {onboardingStatus && (
        <SellerOnboardingChecklist
          status={onboardingStatus}
          storefrontUrl={storefrontUrl}
          onCopyLink={handleShareStore}
          copyMessage={shareMessage}
        />
      )}

      <div className="grid grid-metrics">
        <KpiCard label="Pedidos hoje" value={ordersToday.length} icon="clock" />
        <KpiCard label="Pedidos pendentes" value={pendingOrders} icon="cart" />
        <KpiCard label="Pagamentos a combinar" value={toBeArrangedPayments} icon="wallet" />
        <KpiCard label="Faturamento confirmado" value={formatCurrency(confirmedRevenue)} icon="wallet" />
        <KpiCard label="A receber" value={formatCurrency(pendingRevenue)} icon="tag" />
        <KpiCard label="Produtos" value={products.length} icon="package" />
        <KpiCard label="Clientes únicos" value={uniqueCustomers} icon="user" />
        <KpiCard label="Clientes recorrentes" value={recurringCustomers} icon="user" />
        <KpiCard label="Ticket médio" value={formatCurrency(averageTicket)} icon="wallet" />
        {topCustomer && (
          <KpiCard label="Maior comprador" value={topCustomer.name} icon="user" />
        )}
        {reviewSummary && reviewSummary.totalReviews > 0 && (
          <KpiCard
            label="Avaliação média"
            value={`⭐ ${reviewSummary.averageRating.toFixed(1)} · ${reviewSummary.totalReviews} avaliação${reviewSummary.totalReviews > 1 ? 'ões' : ''}`}
            icon="sparkles"
          />
        )}
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
        <ActionTile title="Avaliações" description="Feedback de clientes" icon="sparkles" to="/lojista/avaliacoes" />
        <ActionTile title="Ajuda" description="Suporte e orientações" icon="check" to="/lojista/ajuda" />
      </div>
    </section>
  )
}
