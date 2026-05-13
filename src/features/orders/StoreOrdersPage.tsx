import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, getStoreOrders, updateOrderPaymentStatus, updateOrderStatus } from '../../services/mockData'
import type { Order, OrderStatus, PaymentStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

type OrderFilterKey =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivered'
  | 'cancelled'
  | 'payment_pending'
  | 'paid'
  | 'to_be_arranged'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Novo / pendente',
  paid: 'Confirmado',
  preparing: 'Preparando',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  awaiting_payment: 'Aguardando pagamento',
  to_be_arranged: 'Pagamento a combinar',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Estornado',
}

const filters: Array<{ key: OrderFilterKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Novos / pendentes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'delivered', label: 'Entregues' },
  { key: 'cancelled', label: 'Cancelados' },
  { key: 'payment_pending', label: 'Pagamento pendente' },
  { key: 'paid', label: 'Pagos' },
  { key: 'to_be_arranged', label: 'Pagamento a combinar' },
]

function getOrderBadgeVariant(status: OrderStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'pending') return 'accent'
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  return 'muted'
}

function getPaymentBadgeVariant(status: PaymentStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'paid') return 'success'
  if (status === 'awaiting_payment' || status === 'to_be_arranged') return 'accent'
  if (status === 'failed' || status === 'refunded') return 'danger'
  return 'muted'
}

function shortOrderId(orderId: string) {
  const value = orderId.split('-').at(-1) ?? orderId
  return value.slice(0, 8).toUpperCase()
}

function sanitizePhone(phone?: string) {
  return (phone ?? '').replace(/\D/g, '')
}

export function StoreOrdersPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [selectedFilter, setSelectedFilter] = useState<OrderFilterKey>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  const refreshOrders = useCallback(() => {
    getStoreOrders(storeId).then(setOrders)
  }, [storeId])

  useEffect(() => {
    refreshOrders()
    getStoreById(storeId).then(setStore)
  }, [refreshOrders, storeId])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  )

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return sortedOrders.filter((order) => {
      const byFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'pending' && order.status === 'pending') ||
        (selectedFilter === 'confirmed' && order.status === 'paid') ||
        (selectedFilter === 'preparing' && order.status === 'preparing') ||
        (selectedFilter === 'delivered' && order.status === 'delivered') ||
        (selectedFilter === 'cancelled' && order.status === 'cancelled') ||
        (selectedFilter === 'payment_pending' && order.paymentStatus === 'awaiting_payment') ||
        (selectedFilter === 'paid' && order.paymentStatus === 'paid') ||
        (selectedFilter === 'to_be_arranged' && order.paymentStatus === 'to_be_arranged')

      if (!byFilter) return false
      if (!term) return true

      const searchable = [
        order.id,
        shortOrderId(order.id),
        order.customerName,
        order.customerPhone,
        ...(order.items?.map((item) => item.productName) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(term)
    })
  }, [searchTerm, selectedFilter, sortedOrders])

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
    refreshOrders()
  }

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    await updateOrderPaymentStatus(orderId, paymentStatus)
    refreshOrders()
  }

  const openWhatsApp = (order: Order) => {
    if (!order.customerPhone) return
    const phone = sanitizePhone(order.customerPhone)
    if (!phone) return

    const baseMessage =
      order.paymentStatus === 'to_be_arranged'
        ? `Olá, ${order.customerName}! Recebemos seu pedido ${order.id} no valor de ${formatCurrency(order.total)}. Vamos combinar o pagamento?`
        : `Olá, ${order.customerName}! Recebemos seu pedido ${order.id} na loja ${store?.name ?? 'nossa loja'}. Podemos confirmar os detalhes?`

    const link = `https://wa.me/${phone}?text=${encodeURIComponent(baseMessage)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((current) => ({ ...current, [orderId]: !current[orderId] }))
  }

  const getStatusActions = (order: Order) => {
    if (order.status === 'pending') {
      return (
        <>
          <Button type="button" variant="secondary" onClick={() => handleUpdateStatus(order.id, 'paid')}>
            Confirmar pedido
          </Button>
          <Button type="button" variant="danger" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
            Cancelar pedido
          </Button>
        </>
      )
    }

    if (order.status === 'paid') {
      return (
        <>
          <Button type="button" variant="secondary" onClick={() => handleUpdateStatus(order.id, 'preparing')}>
            Marcar preparando
          </Button>
          <Button type="button" variant="danger" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
            Cancelar pedido
          </Button>
        </>
      )
    }

    if (order.status === 'preparing') {
      return (
        <Button type="button" variant="secondary" onClick={() => handleUpdateStatus(order.id, 'delivered')}>
          Marcar entregue
        </Button>
      )
    }

    return (
      <Button type="button" variant="ghost" onClick={() => toggleExpanded(order.id)}>
        Ver detalhes
      </Button>
    )
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Pedidos"
        icon="cart"
        title="Central de pedidos do lojista"
        description={`Acompanhe pedidos de ${store?.name ?? 'sua loja'}, confirme pagamentos e fale com clientes por WhatsApp.`}
      />

      <Card variant="layered" title="Filtros e busca" subtitle="Encontre pedidos por etapa operacional e pagamento.">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <Input
            label="Buscar pedido"
            placeholder="Nome do cliente, telefone, código do pedido ou produto"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {filters.map((filter) => (
              <Button
                key={filter.key}
                type="button"
                variant={selectedFilter === filter.key ? 'primary' : 'ghost'}
                onClick={() => setSelectedFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrders[order.id] ?? false
          return (
            <Card
              key={order.id}
              variant="layered"
              title={`Pedido #${shortOrderId(order.id)}`}
              subtitle={`${order.customerName} • ${new Date(order.createdAt).toLocaleString('pt-BR')}`}
            >
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <Badge variant={getOrderBadgeVariant(order.status)}>{statusLabel[order.status]}</Badge>
                <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>{paymentStatusLabel[order.paymentStatus]}</Badge>
                <Badge variant="muted">{order.deliveryType === 'pickup' ? 'Retirada' : 'Entrega'}</Badge>
                {order.paymentMethod && <Badge variant="muted">{order.paymentMethod}</Badge>}
              </div>

              <div className="inline-info" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{formatCurrency(order.total)}</strong>
                {order.paidAt && <small className="muted">Pago em {new Date(order.paidAt).toLocaleString('pt-BR')}</small>}
              </div>

              <div className="stack" style={{ gap: '0.25rem' }}>
                <small className="muted">ID completo: {order.id}</small>
                {order.customerPhone && <small className="muted">Telefone: {order.customerPhone}</small>}
                {order.notes && <small className="muted">Observação: {order.notes}</small>}
              </div>

              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {getStatusActions(order)}
                {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                  <Button type="button" variant="secondary" onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}>
                    Confirmar pagamento
                  </Button>
                )}
                {order.paymentStatus !== 'failed' && order.paymentStatus !== 'refunded' && order.paymentStatus !== 'paid' && (
                  <Button type="button" variant="ghost" onClick={() => handleUpdatePaymentStatus(order.id, 'failed')}>
                    Marcar pagamento falhou
                  </Button>
                )}
                {order.paymentStatus === 'paid' && (
                  <Button type="button" variant="secondary" onClick={() => handleUpdatePaymentStatus(order.id, 'refunded')}>
                    Estornar pagamento
                  </Button>
                )}
                {order.customerPhone && (
                  <Button type="button" variant="primary" onClick={() => openWhatsApp(order)}>
                    Chamar cliente
                  </Button>
                )}
              </div>

              {(isExpanded || order.status === 'pending' || order.status === 'preparing') && (
                <div className="stack" style={{ marginTop: '0.75rem', gap: '0.4rem' }}>
                  <small className="muted" style={{ fontWeight: 600 }}>Detalhes do pedido</small>
                  {(order.items ?? []).map((item) => (
                    <small key={item.product_id} className="muted">
                      {item.productName} × {item.quantity} — {formatCurrency(item.quantity * item.price)}
                    </small>
                  ))}
                  <small className="muted">Subtotal: {formatCurrency(order.total)}</small>
                  <small className="muted">Entrega/taxa: {formatCurrency(0)}</small>
                  <small className="muted">Total: {formatCurrency(order.total)}</small>
                  {order.address && <small className="muted">Endereço: {order.address}</small>}
                  {order.paymentInstructions && <small className="muted">Instruções: {order.paymentInstructions}</small>}
                  <small className="muted">Histórico: criado em {new Date(order.createdAt).toLocaleString('pt-BR')}.</small>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
