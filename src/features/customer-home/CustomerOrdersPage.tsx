import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  getCustomerOrders,
  getStoreById,
  repeatOrder,
} from '../../services/mockData'
import type { Order, OrderStatus, PaymentStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação',
  paid: 'Confirmado',
  preparing: 'Em preparação',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  awaiting_payment: 'Aguardando pagamento',
  to_be_arranged: 'Pagamento a combinar',
  paid: 'Pagamento confirmado',
  failed: 'Pagamento não concluído',
  refunded: 'Pagamento reembolsado',
}

function getStatusVariant(status: OrderStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'cancelled') return 'danger'
  if (status === 'delivered') return 'success'
  if (status === 'pending') return 'accent'
  return 'muted'
}

function getPaymentVariant(status: PaymentStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'paid') return 'success'
  if (status === 'failed' || status === 'refunded') return 'danger'
  if (status === 'to_be_arranged') return 'accent'
  return 'muted'
}

interface OrderWithStore {
  order: Order
  store: Store | undefined
}

export function CustomerOrdersPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<OrderWithStore[]>([])
  const [loading, setLoading] = useState(true)
  const [repeatMessage, setRepeatMessage] = useState('')

  useEffect(() => {
    async function load() {
      const orders = await getCustomerOrders()
      const withStores = await Promise.all(
        orders.map(async (order) => ({
          order,
          store: await getStoreById(order.store_id),
        })),
      )
      setItems(withStores)
      setLoading(false)
    }
    load()
  }, [])

  const handleRepeatOrder = async (orderId: string) => {
    const result = await repeatOrder(orderId)
    if (result.addedCount === 0) {
      setRepeatMessage('Nenhum produto disponível para repetir este pedido.')
      return
    }
    const msg = result.skippedCount > 0
      ? `${result.addedCount} ${result.addedCount === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho. ${result.skippedCount} ${result.skippedCount === 1 ? 'item ignorado' : 'itens ignorados'} (indisponível).`
      : `${result.addedCount} ${result.addedCount === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho!`
    setRepeatMessage(msg)
    if (result.storeSlug) {
      navigate(`/loja/${result.storeSlug}/carrinho`)
    }
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Meus pedidos"
        icon="clock"
        title="Acompanhe seus pedidos"
        description="Veja o andamento das compras e receba atualizações de cada etapa em um só lugar."
      />

      {repeatMessage && <p className="muted">{repeatMessage}</p>}

      {loading && <p className="muted">Carregando pedidos…</p>}

      {!loading && items.length === 0 && (
        <Card title="Nenhum pedido ainda" subtitle="Seus pedidos aparecem aqui após você comprar em uma loja." variant="default">
          <p className="muted">Acesse o link enviado pelo lojista, escolha produtos e finalize um pedido para vê-lo aqui.</p>
        </Card>
      )}

      {items.map(({ order, store }) => {
        const whatsappUrl =
          store?.whatsapp
            ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Olá! Quero acompanhar meu pedido #${order.id} feito na ${store.name}.`)}`
            : null
        const itemsSummary = order.items?.slice(0, 3).map((i) => `${i.productName} ×${i.quantity}`).join(', ')
        const moreItems = (order.items?.length ?? 0) > 3 ? ` +${(order.items?.length ?? 0) - 3} item(s)` : ''

        return (
          <Card
            key={order.id}
            title={store ? store.name : `Loja #${order.store_id}`}
            subtitle={new Date(order.createdAt).toLocaleString('pt-BR')}
            variant="layered"
          >
            <div className="stack" style={{ gap: '0.5rem' }}>
              <div className="inline-info">
                <Badge variant={getStatusVariant(order.status)}>{statusLabel[order.status]}</Badge>
                <Badge variant={getPaymentVariant(order.paymentStatus)}>{paymentStatusLabel[order.paymentStatus]}</Badge>
              </div>
              {order.paymentMethod && (
                <p className="muted">
                  <Icon name="wallet" className="icon-sm" /> {order.paymentMethod}
                </p>
              )}
              {itemsSummary && (
                <p className="muted">{itemsSummary}{moreItems}</p>
              )}
              <div className="inline-info">
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
            <div className="inline-info" style={{ marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Link to={`/cliente/pedidos/${order.id}`}>
                <Button variant="accent" size="md">
                  <Icon name="arrowRight" className="icon-sm" />
                  Ver detalhes
                </Button>
              </Link>
              {store && (
                <Link to={`/loja/${store.slug}`}>
                  <Button variant="secondary" size="md">Abrir loja</Button>
                </Link>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="md">Chamar loja</Button>
                </a>
              )}
              <Button variant="ghost" size="md" onClick={() => { void handleRepeatOrder(order.id) }}>
                Comprar novamente
              </Button>
            </div>
          </Card>
        )
      })}
    </section>
  )
}

