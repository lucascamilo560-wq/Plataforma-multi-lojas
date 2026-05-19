import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ActionTile } from '../../components/ui/ActionTile'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { KpiCard } from '../../components/ui/KpiCard'
import { APP_BRAND } from '../../config/brand'
import { useMockSession } from '../../hooks/useMockSession'
import {
  getProductsByStore,
  getSellerOnboardingStatus,
  getStoreById,
  getStoreCustomers,
  getStoreOrders,
  getStoreReviewSummary,
} from '../../services/mockData'
import type { CustomerSummary, SellerOnboardingStatus, StoreReviewSummary } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, OrderStatus, PaymentStatus, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { buildPublicUrl } from '../../utils/publicUrl'
import { shareOrCopy } from '../../utils/share'
import { SellerOnboardingChecklist } from './SellerOnboardingChecklist'

interface Recommendation {
  id: string
  icon: Parameters<typeof Icon>[0]['name']
  title: string
  description: string
  to: string
  label: string
}

interface AttentionAlert {
  id: string
  icon: Parameters<typeof Icon>[0]['name']
  title: string
  description: string
  actionLabel: string
  actionTo: string
  variant: 'warning' | 'danger' | 'positive'
}

function formatOrderTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toDateString()
  if (d.toDateString() === todayStr) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Aguardando',
  paid: 'Pago',
  preparing: 'Preparando',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  awaiting_payment: 'Ag. pagamento',
  to_be_arranged: 'A combinar',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
}

export function StoreDashboardPage() {
  const { storeId } = useMockSession()
  const location = useLocation()
  const navigate = useNavigate()
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

  const activeProducts = useMemo(() => products.filter((p) => p.isActive).length, [products])

  const preparingOrders = useMemo(() => orders.filter((o) => o.status === 'preparing').length, [orders])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .filter((o) => o.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [orders],
  )

  const attentionAlerts = useMemo<AttentionAlert[]>(() => {
    const alerts: AttentionAlert[] = []

    if (store && !store.isActive) {
      alerts.push({
        id: 'store-paused',
        icon: 'storefront',
        title: 'Loja pausada',
        description: 'Sua loja está inativa. Clientes não conseguem comprar.',
        actionLabel: 'Ativar loja',
        actionTo: '/lojista/minha-loja',
        variant: 'danger',
      })
    }

    if (activeProducts === 0) {
      alerts.push({
        id: 'no-products',
        icon: 'package',
        title: 'Sem produtos ativos',
        description: 'Sua vitrine está vazia. Adicione produtos para vender.',
        actionLabel: 'Adicionar produto',
        actionTo: '/lojista/produtos/novo',
        variant: 'warning',
      })
    }

    if (pendingOrders > 0) {
      alerts.push({
        id: 'pending-orders',
        icon: 'cart',
        title: `${pendingOrders} pedido${pendingOrders > 1 ? 's' : ''} aguardando confirmação`,
        description: 'Responda rapidamente para não perder vendas.',
        actionLabel: 'Ver pedidos',
        actionTo: '/lojista/pedidos',
        variant: 'warning',
      })
    }

    if (toBeArrangedPayments > 0) {
      alerts.push({
        id: 'payments-to-arrange',
        icon: 'wallet',
        title: `${toBeArrangedPayments} pagamento${toBeArrangedPayments > 1 ? 's' : ''} a combinar`,
        description: 'Combine a forma de pagamento com o cliente.',
        actionLabel: 'Resolver',
        actionTo: '/lojista/pedidos',
        variant: 'warning',
      })
    }

    if (preparingOrders > 0) {
      alerts.push({
        id: 'preparing-orders',
        icon: 'clock',
        title: `${preparingOrders} pedido${preparingOrders > 1 ? 's' : ''} em preparo`,
        description: 'Atualize o status assim que estiver pronto.',
        actionLabel: 'Atender',
        actionTo: '/lojista/pedidos',
        variant: 'warning',
      })
    }

    return alerts.slice(0, 3)
  }, [store, activeProducts, pendingOrders, toBeArrangedPayments, preparingOrders])

  const storeTheme = getStoreTheme(store)
  const storefrontPath = store?.slug ? `/loja/${store.slug}` : '/cliente/explorar'
  const storefrontUrl = buildPublicUrl(storefrontPath)

  const handleShareStore = async () => {
    setShareMessage('')
    const result = await shareOrCopy({
      title: `${store?.name ?? 'Minha loja'} — ${APP_BRAND.name}`,
      text: `Confira a vitrine de ${store?.name ?? 'minha loja'}`,
      url: storefrontUrl,
    })
    if (result === 'shared' || result === 'copied') {
      setShareMessage('Link da vitrine copiado para compartilhar.')
    } else if (result === 'failed') {
      setShareMessage('Não foi possível copiar automaticamente. Use o botão de ver vitrine para abrir o link.')
    }
  }

  const recommendations = useMemo<Recommendation[]>(() => {
    const list: Recommendation[] = []

    if (onboardingStatus && !onboardingStatus.isReadyToShare) {
      const nextStep = onboardingStatus.steps.find((s) => !s.completed)
      list.push({
        id: 'onboarding',
        icon: 'check',
        title: 'Concluir configuração da loja',
        description: 'Complete as etapas para começar a vender com mais resultado.',
        to: nextStep?.to ?? '/lojista/minha-loja',
        label: 'Continuar',
      })
    }

    if (activeProducts === 0) {
      list.push({
        id: 'products',
        icon: 'package',
        title: 'Cadastrar primeiro produto',
        description: 'Sua vitrine está vazia. Adicione produtos para começar a vender.',
        to: '/lojista/produtos/novo',
        label: 'Adicionar produto',
      })
    }

    if (pendingOrders > 0) {
      list.push({
        id: 'orders',
        icon: 'cart',
        title: 'Responder pedidos pendentes',
        description: `${pendingOrders} pedido${pendingOrders > 1 ? 's' : ''} aguardando sua resposta.`,
        to: '/lojista/pedidos',
        label: 'Ver pedidos',
      })
    }

    if (toBeArrangedPayments > 0) {
      list.push({
        id: 'payments',
        icon: 'wallet',
        title: 'Combinar pagamentos',
        description: `${toBeArrangedPayments} pagamento${toBeArrangedPayments > 1 ? 's' : ''} aguardando combinação.`,
        to: '/lojista/pedidos',
        label: 'Ver pedidos',
      })
    }

    if (list.length === 0) {
      list.push({
        id: 'share',
        icon: 'storefront',
        title: 'Compartilhar vitrine e vender mais',
        description: 'Sua loja está pronta. Envie o link para seus clientes e aumente suas vendas.',
        to: '/lojista/minha-vitrine',
        label: 'Ver minha vitrine',
      })
    }

    return list
  }, [onboardingStatus, activeProducts, pendingOrders, toBeArrangedPayments])

  return (
    <section className="stack-xl">
      {/* ─── Central da loja – header premium ─── */}
      <article
        className="seller-store-header"
        style={{
          background: `linear-gradient(135deg, ${storeTheme.primaryColor} 0%, ${storeTheme.accentColor}cc 100%)`,
        }}
      >
        {storeTheme.coverUrl && (
          <div
            className="seller-store-header-bg"
            style={{ backgroundImage: `url(${storeTheme.coverUrl})` }}
          />
        )}
        <div className="seller-store-header-content">
          {/* HubMascate kicker */}
          <p className="seller-hub-kicker">
            <Icon name="hub" className="icon-sm" style={{ opacity: 0.75 }} />
            {APP_BRAND.sellerKicker}
          </p>

          {/* Identity row */}
          <div className="seller-header-identity">
            {storeTheme.logoUrl ? (
              <img
                src={storeTheme.logoUrl}
                alt={`Logo da loja ${store?.name ?? 'Minha loja'}`}
                className="seller-header-logo"
              />
            ) : (
              <span className="seller-header-logo-placeholder">
                <Icon name="storefront" className="icon-md" style={{ opacity: 0.8 }} />
              </span>
            )}
            <div className="seller-header-info">
              <h1 className="seller-header-name">{store?.name ?? 'Minha loja'}</h1>
              {(store?.category || store?.city) && (
                <p className="seller-header-meta">
                  {[store.category, store.city].filter(Boolean).join(' · ')}
                </p>
              )}
              <div style={{ marginTop: '0.35rem' }}>
                <Badge variant={store?.isActive ? 'success' : 'muted'}>
                  {store?.isActive ? '● Loja ativa' : '○ Loja pausada'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="seller-header-actions">
            <Link to={storefrontPath}>
              <Button
                variant="secondary"
                size="sm"
                style={{ background: 'rgba(255,255,255,0.92)', color: storeTheme.primaryColor } as React.CSSProperties}
              >
                <Icon name="storefront" className="icon-sm" />
                Ver vitrine
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareStore}
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.38)' } as React.CSSProperties}
            >
              <Icon name="hub" className="icon-sm" />
              Compartilhar
            </Button>
            <Link to="/lojista/produtos/novo">
              <Button
                variant="ghost"
                size="sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.38)' } as React.CSSProperties}
              >
                <Icon name="package" className="icon-sm" />
                Novo produto
              </Button>
            </Link>
            <Link to="/lojista/pedidos">
              <Button
                variant="ghost"
                size="sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.38)' } as React.CSSProperties}
              >
                <Icon name="cart" className="icon-sm" />
                Pedidos
              </Button>
            </Link>
          </div>

          {shareMessage && (
            <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.9 }}>{shareMessage}</p>
          )}
        </div>
      </article>

      {/* ─── Loja recém-criada ─── */}
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

      {/* ─── Onboarding ─── */}
      {onboardingStatus && (
        <SellerOnboardingChecklist
          status={onboardingStatus}
          storefrontUrl={storefrontUrl}
          onCopyLink={handleShareStore}
          copyMessage={shareMessage}
        />
      )}

      {/* ─── Hoje na loja ─── */}
      <div className="stack">
        <p className="seller-section-label">
          <Icon name="clock" className="icon-sm" />
          Hoje na loja
        </p>
        <div className="seller-today-strip">
          <div className={`seller-today-item${pendingOrders > 0 ? ' seller-today-item--alert' : ''}`}>
            <span className={`seller-today-value${pendingOrders > 0 ? ' seller-today-value--alert' : ''}`}>
              {ordersToday.length}
            </span>
            <span className="seller-today-label">Pedidos hoje</span>
          </div>
          <div className={`seller-today-item${pendingOrders > 0 ? ' seller-today-item--alert' : ''}`}>
            <span className={`seller-today-value${pendingOrders > 0 ? ' seller-today-value--alert' : ''}`}>
              {pendingOrders}
            </span>
            <span className="seller-today-label">Pendentes</span>
          </div>
          <div className="seller-today-item">
            <span className="seller-today-value">{formatCurrency(pendingRevenue)}</span>
            <span className="seller-today-label">A receber</span>
          </div>
          <div className={`seller-today-item${toBeArrangedPayments > 0 ? ' seller-today-item--alert' : ''}`}>
            <span className={`seller-today-value${toBeArrangedPayments > 0 ? ' seller-today-value--alert' : ''}`}>
              {toBeArrangedPayments}
            </span>
            <span className="seller-today-label">A combinar</span>
          </div>
        </div>
      </div>

      {/* ─── Atalhos do dia ─── */}
      <div className="seller-shortcuts-strip">
        <Link to="/lojista/produtos/novo" className="seller-shortcut-pill">
          <Icon name="package" className="icon-sm" />
          Novo produto
        </Link>
        <Link to="/lojista/pedidos" className="seller-shortcut-pill">
          <Icon name="cart" className="icon-sm" />
          Ver pedidos
          {pendingOrders > 0 && (
            <span className="seller-shortcut-badge">{pendingOrders}</span>
          )}
        </Link>
        <button type="button" className="seller-shortcut-pill" onClick={handleShareStore}>
          <Icon name="hub" className="icon-sm" />
          Compartilhar
        </button>
        <Link to="/lojista/pagamentos" className="seller-shortcut-pill">
          <Icon name="wallet" className="icon-sm" />
          Pagamentos
        </Link>
      </div>

      {/* ─── Agora precisa de atenção ─── */}
      <div className="stack">
        <p className="seller-section-label">
          <Icon name="shield" className="icon-sm" />
          Agora precisa de atenção
        </p>
        {attentionAlerts.length === 0 ? (
          <div className="seller-alert-card seller-alert-card--positive">
            <span className="seller-alert-icon">
              <Icon name="check" className="icon-md" />
            </span>
            <div className="seller-alert-content">
              <p className="seller-alert-title">Tudo certo por agora</p>
              <p className="seller-alert-description">Você não tem pendências urgentes.</p>
            </div>
          </div>
        ) : (
          <div className="seller-alerts-list">
            {attentionAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`seller-alert-card seller-alert-card--${alert.variant}`}
              >
                <span className="seller-alert-icon">
                  <Icon name={alert.icon} className="icon-md" />
                </span>
                <div className="seller-alert-content">
                  <p className="seller-alert-title">{alert.title}</p>
                  <p className="seller-alert-description">{alert.description}</p>
                </div>
                <Link to={alert.actionTo} style={{ flexShrink: 0 }}>
                  <Button variant="accent" size="sm">
                    {alert.actionLabel}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Pedidos recentes ─── */}
      {recentOrders.length > 0 && (
        <div className="stack">
          <div className="seller-section-header">
            <p className="seller-section-label">
              <Icon name="cart" className="icon-sm" />
              Pedidos recentes
            </p>
            <Link to="/lojista/pedidos" className="seller-section-link">
              Ver todos
              <Icon name="arrowRight" className="icon-sm" />
            </Link>
          </div>
          <div className="seller-orders-list">
            {recentOrders.map((order) => {
              const isPending = order.status === 'pending'
              const hasPaymentPending =
                order.paymentStatus === 'awaiting_payment' ||
                order.paymentStatus === 'to_be_arranged'
              const shortId = order.id.slice(-6).toUpperCase()
              return (
                <div
                  key={order.id}
                  className={`seller-order-item${isPending ? ' seller-order-item--pending' : ''}`}
                >
                  <div className="seller-order-main">
                    <div className="seller-order-top">
                      <span className="seller-order-id">#{shortId}</span>
                      <span className="seller-order-time">{formatOrderTime(order.createdAt)}</span>
                    </div>
                    <p className="seller-order-customer">{order.customerName}</p>
                    <div className="seller-order-badges">
                      <Badge variant={isPending ? 'danger' : order.status === 'delivered' ? 'success' : 'muted'}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                      {hasPaymentPending && (
                        <Badge variant="danger">
                          {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="seller-order-right">
                    <span className="seller-order-total">{formatCurrency(order.total)}</span>
                    <button
                      type="button"
                      className="seller-order-action"
                      onClick={() => navigate('/lojista/pedidos')}
                    >
                      {isPending ? 'Atender' : 'Ver'}
                      <Icon name="arrowRight" className="icon-sm" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Próximas ações recomendadas ─── */}
      <div className="stack">
        <p className="seller-section-label">
          <Icon name="hub" className="icon-sm" />
          Próximas ações recomendadas
        </p>
        <div className="seller-rec-list">
          {recommendations.map((rec) => (
            <div key={rec.id} className="seller-rec-item">
              <span className="seller-rec-icon">
                <Icon name={rec.icon} className="icon-md" />
              </span>
              <div className="seller-rec-content">
                <p className="seller-rec-title">{rec.title}</p>
                <p className="seller-rec-description">{rec.description}</p>
              </div>
              <Link to={rec.to} style={{ flexShrink: 0 }}>
                <Button variant="accent" size="sm">
                  {rec.label}
                  <Icon name="arrowRight" className="icon-sm" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ─── KPIs agrupados ─── */}
      <div className="stack-lg">
        {/* Operação */}
        <div className="stack">
          <p className="seller-section-label">
            <Icon name="chart" className="icon-sm" />
            Operação
          </p>
          <div className="grid grid-metrics">
            <KpiCard label="Pedidos hoje" value={ordersToday.length} icon="clock" />
            <KpiCard label="Pedidos pendentes" value={pendingOrders} icon="cart" />
            <KpiCard label="Pagamentos a combinar" value={toBeArrangedPayments} icon="wallet" />
          </div>
        </div>

        {/* Financeiro */}
        <div className="stack">
          <p className="seller-section-label">
            <Icon name="wallet" className="icon-sm" />
            Financeiro
          </p>
          <div className="grid grid-metrics">
            <KpiCard label="Faturamento confirmado" value={formatCurrency(confirmedRevenue)} icon="wallet" />
            <KpiCard label="A receber" value={formatCurrency(pendingRevenue)} icon="tag" />
            <KpiCard label="Ticket médio" value={formatCurrency(averageTicket)} icon="chart" />
          </div>
        </div>

        {/* Catálogo e clientes */}
        <div className="stack">
          <p className="seller-section-label">
            <Icon name="user" className="icon-sm" />
            Catálogo e clientes
          </p>
          <div className="grid grid-metrics">
            <KpiCard label="Produtos" value={products.length} icon="package" />
            <KpiCard label="Clientes únicos" value={uniqueCustomers} icon="user" />
            <KpiCard label="Clientes recorrentes" value={recurringCustomers} icon="user" />
            {topCustomer && (
              <KpiCard label="Maior comprador" value={topCustomer.name} icon="star" />
            )}
          </div>
        </div>

        {/* Reputação */}
        {reviewSummary && reviewSummary.totalReviews > 0 && (
          <div className="stack">
            <p className="seller-section-label">
              <Icon name="star" className="icon-sm" />
              Reputação
            </p>
            <div className="grid grid-metrics">
              <KpiCard
                label="Avaliação média"
                value={`⭐ ${reviewSummary.averageRating.toFixed(1)} · ${reviewSummary.totalReviews} avaliação${reviewSummary.totalReviews > 1 ? 'ões' : ''}`}
                icon="star"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Ferramentas organizadas por categoria ─── */}
      <div className="stack-lg">
        <p className="seller-section-label seller-section-label--lg">
          <Icon name="hub" className="icon-sm" />
          Ferramentas da sua loja
        </p>

        {/* Vender */}
        <div className="stack">
          <p className="seller-tiles-cat-label">Vender</p>
          <div className="grid grid-tiles">
            <ActionTile title="Produtos" description="Gerencie catálogo" icon="package" to="/lojista/produtos" />
            <ActionTile title="Promoções" description="Crie campanhas" icon="tag" to="/lojista/promocoes" />
            <ActionTile title="Cupons" description="Controle descontos" icon="tag" to="/lojista/cupons" />
            <ActionTile title="Minha vitrine" description="Link, QR Code e prévia" icon="storefront" to="/lojista/minha-vitrine" />
          </div>
        </div>

        {/* Atender */}
        <div className="stack">
          <p className="seller-tiles-cat-label">Atender</p>
          <div className="grid grid-tiles">
            <ActionTile title="Pedidos" description="Acompanhe entregas" icon="cart" to="/lojista/pedidos" />
            <ActionTile title="Clientes" description="Veja sua base" icon="user" to="/lojista/clientes" />
            <ActionTile title="Avaliações" description="Feedback de clientes" icon="star" to="/lojista/avaliacoes" />
          </div>
        </div>

        {/* Configurar */}
        <div className="stack">
          <p className="seller-tiles-cat-label">Configurar</p>
          <div className="grid grid-tiles">
            <ActionTile title="Minha loja" description="Dados e configurações" icon="storefront" to="/lojista/minha-loja" />
            <ActionTile title="Minha marca" description="Visual da loja" icon="palette" to="/lojista/marca" />
            <ActionTile title="Pagamentos" description="Formas aceitas" icon="wallet" to="/lojista/pagamentos" />
            <ActionTile title="Entrega/Retirada" description="Defina logística" icon="clock" to="/lojista/entrega" />
          </div>
        </div>

        {/* Acompanhar */}
        <div className="stack">
          <p className="seller-tiles-cat-label">Acompanhar</p>
          <div className="grid grid-tiles">
            <ActionTile title="Relatórios" description="Análises da loja" icon="chart" to="/lojista/relatorios" />
            <ActionTile title="Ajuda" description="Suporte e orientações" icon="shield" to="/lojista/ajuda" />
          </div>
        </div>
      </div>
    </section>
  )
}
