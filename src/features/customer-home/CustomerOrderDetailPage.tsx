import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { buildOrderTimeline, derivePaymentMethodKey, getOrderWithStore } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, OrderPaymentMethod, OrderStatus, PaymentStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { OrderTimeline } from '../orders/components/OrderTimeline'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação',
  paid: 'Confirmado',
  preparing: 'Em preparação',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  awaiting_payment: 'Aguardando pagamento',
  to_be_arranged: 'Pagamento a combinar com a loja',
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

function getPaymentStatusVariant(status: PaymentStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'paid') return 'success'
  if (status === 'failed' || status === 'refunded') return 'danger'
  if (status === 'to_be_arranged') return 'accent'
  return 'muted'
}

function resolvePaymentMethodKey(order: Order): OrderPaymentMethod {
  return order.paymentMethodKey ?? derivePaymentMethodKey(order.paymentMethod)
}

export function CustomerOrderDetailPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | undefined>()
  const [store, setStore] = useState<Store | undefined>()
  const [pixCopied, setPixCopied] = useState(false)

  useEffect(() => {
    getOrderWithStore(orderId).then((result) => {
      if (result) {
        setOrder(result.order)
        setStore(result.store)
      }
    })
  }, [orderId])

  if (!order) {
    return (
      <section className="stack-lg">
        <SectionHeader
          kicker="Pedido"
          icon="clock"
          title="Pedido não encontrado"
          description="Não encontramos este pedido. Verifique o link ou entre em contato com a loja."
        />
        <Link to="/cliente/pedidos">
          <Button variant="secondary">Voltar para pedidos</Button>
        </Link>
      </section>
    )
  }

  const storeTheme = getStoreTheme(store)
  const whatsappUrl = store?.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Olá! Quero acompanhar meu pedido #${order.id} feito na ${store?.name ?? 'loja'}.`)}`
    : null

  const paymentMethodKey = resolvePaymentMethodKey(order)
  const isPixPayment = paymentMethodKey === 'pix'
  const isWhatsappPayment = paymentMethodKey === 'whatsapp'
  const isExternalLink = paymentMethodKey === 'external_payment_link'
  const isPaymentArranged = order.paymentStatus === 'to_be_arranged'

  const handleCopyPix = () => {
    const key = order.paymentInstructions ?? ''
    if (!key) return
    navigator.clipboard.writeText(key).then(() => {
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 3000)
    })
  }

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Detalhe do pedido"
        icon="clock"
        title={`Pedido #${order.id}`}
        description={`Feito em ${new Date(order.createdAt).toLocaleString('pt-BR')} ${store ? `na loja ${store.name}` : ''}`}
      />

      <div className="grid">
        <Card
          title="Status do pedido"
          subtitle={store?.name ?? `Loja #${order.store_id}`}
          variant="accentCorner"
        >
          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <Badge variant={getStatusVariant(order.status)}>{statusLabel[order.status]}</Badge>
            <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>{paymentStatusLabel[order.paymentStatus]}</Badge>
          </div>
          {order.paymentMethod && (
            <p className="muted">
              <Icon name="wallet" className="icon-sm" /> Pagamento: {order.paymentMethod}
            </p>
          )}
          {order.deliveryType && (
            <p className="muted">
              <Icon name="package" className="icon-sm" />{' '}
              {order.deliveryType === 'delivery' ? 'Entrega em domicílio' : order.deliveryType === 'pickup' ? 'Retirada na loja' : 'Entrega a combinar'}
              {order.address ? ` — ${order.address}` : ''}
              {order.deliveryType === 'pickup' && order.pickupAddress ? ` — ${order.pickupAddress}` : ''}
            </p>
          )}
          {order.notes && <p className="muted">Obs: {order.notes}</p>}
          {order.orderPlacedWhileClosed && (
            <p className="muted" style={{ color: 'var(--color-accent, #3A86FF)' }}>
              ⏰ Pedido enviado fora do horário. A loja atenderá no próximo horário de funcionamento.
            </p>
          )}
        </Card>

        <Card title="Linha do tempo" subtitle="Histórico do pedido" variant="layered">
          <OrderTimeline entries={buildOrderTimeline(order)} />
        </Card>

        {order.items && order.items.length > 0 && (
          <Card title="Itens do pedido" subtitle="O que foi pedido" variant="layered">
            <div className="stack" style={{ gap: '0.5rem' }}>
              {order.items.map((item) => (
                <div key={item.product_id} className="inline-info">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
              <div className="inline-info">
                <span className="muted">Subtotal</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
              <div className="inline-info">
                <strong>Total</strong>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
          </Card>
        )}

        <Card title="Instruções de pagamento" subtitle="O que fazer agora" variant="layered">
          <div className="stack" style={{ gap: '0.75rem' }}>
            {isPaymentArranged && (
              <p className="muted">
                <strong>Pagamento a combinar:</strong> entre em contato com a loja para acertar a forma de pagamento antes da entrega.
              </p>
            )}
            {isPixPayment && order.paymentStatus !== 'paid' && (
              <div className="stack" style={{ gap: '0.5rem' }}>
                <p className="muted">
                  <strong>Pix:</strong>{' '}
                  {order.paymentInstructions
                    ? 'Copie a chave abaixo e realize o pagamento:'
                    : 'Aguarde as instruções de pagamento via Pix enviadas pela loja.'}
                </p>
                {order.paymentInstructions && (
                  <Button variant="secondary" size="md" onClick={handleCopyPix}>
                    <Icon name="check" className="icon-sm" />
                    {pixCopied ? 'Chave copiada!' : 'Copiar chave Pix'}
                  </Button>
                )}
              </div>
            )}
            {isExternalLink && order.paymentInstructions && order.paymentStatus !== 'paid' && (
              <a href={order.paymentInstructions} target="_blank" rel="noopener noreferrer">
                <Button variant="store" storeColor={storeTheme.primaryColor}>
                  Abrir link de pagamento
                </Button>
              </a>
            )}
            {(isWhatsappPayment || isPaymentArranged) && whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="store" storeColor={storeTheme.primaryColor}>
                  Chamar loja no WhatsApp
                </Button>
              </a>
            )}
            {!isWhatsappPayment && !isPaymentArranged && whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">Falar com a loja pelo WhatsApp</Button>
              </a>
            )}
          </div>
        </Card>

        <Card title="Ações" subtitle="Continue comprando" variant="default">
          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {store && (
              <Link to={`/loja/${store.slug}`}>
                <Button variant="accent">Abrir loja</Button>
              </Link>
            )}
            <Link to="/cliente/pedidos">
              <Button variant="secondary">Todos os pedidos</Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}
