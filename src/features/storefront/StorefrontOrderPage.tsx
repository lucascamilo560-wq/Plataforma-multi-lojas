import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getOrderById, getStoreBySlug, derivePaymentMethodKey } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, OrderPaymentMethod, OrderStatus, PaymentStatus, Store } from '../../types'
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

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        setCopyError(false)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {
        setCopyError(true)
        setTimeout(() => setCopyError(false), 3000)
      },
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Button variant="secondary" onClick={handleCopy}>
        {copied ? '✅ Copiado!' : label}
      </Button>
      {copyError && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-error, #dc2626)', margin: 0 }}>
          Não foi possível copiar. Copie manualmente.
        </p>
      )}
    </div>
  )
}

export function StorefrontOrderPage() {
  const { slug = '', orderId = '' } = useParams()
  const [store, setStore] = useState<Store | undefined>()
  const [order, setOrder] = useState<Order | undefined>()

  useEffect(() => {
    getStoreBySlug(slug).then(setStore)
    getOrderById(orderId).then(setOrder)
  }, [slug, orderId])

  if (!order || !store) {
    return (
      <section className="stack-lg">
        <SectionHeader
          kicker="Pedido"
          icon="clock"
          title="Pedido não encontrado"
          description="Não encontramos este pedido. Verifique o link ou entre em contato com a loja."
        />
        <Link to={`/loja/${slug}`}>
          <Button variant="secondary">Voltar para a loja</Button>
        </Link>
      </section>
    )
  }

  const storeTheme = getStoreTheme(store)

  const paymentMethodKey = resolvePaymentMethodKey(order)
  const isPixPayment = paymentMethodKey === 'pix'
  const isWhatsappPayment = paymentMethodKey === 'whatsapp'
  const isExternalLink = paymentMethodKey === 'external_payment_link'
  const isPaymentArranged = order.paymentStatus === 'to_be_arranged'

  const externalPaymentUrl = order.externalPaymentUrl ?? (isExternalLink ? order.paymentInstructions : undefined)

  const whatsappOrderMessage = store.whatsapp
    ? `Olá! Fiz o pedido #${order.id} na loja ${store.name}, no valor de ${formatCurrency(order.total)}. Podemos combinar o pagamento?`
    : null
  const whatsappPaymentUrl = store.whatsapp && whatsappOrderMessage
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(whatsappOrderMessage)}`
    : null
  const whatsappContactUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Olá! Quero acompanhar meu pedido #${order.id} feito na ${store.name}.`)}`
    : null

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Pedido confirmado"
        icon="check"
        title="A loja recebeu seu pedido!"
        description={`Acompanhe o status abaixo. A ${store.name} cuidará do seu pedido com atenção.`}
      />

      <div className="grid">
        <Card
          title={`Pedido #${order.id}`}
          subtitle={`Criado em ${new Date(order.createdAt).toLocaleString('pt-BR')}`}
          variant="accentCorner"
        >
          <div className="inline-info">
            <Badge variant={getStatusVariant(order.status)}>{statusLabel[order.status]}</Badge>
            <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>{paymentStatusLabel[order.paymentStatus]}</Badge>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
          {order.paymentMethod && (
            <p className="muted">Pagamento: {order.paymentMethod}</p>
          )}
          {order.deliveryType && (
            <p className="muted">
              {order.deliveryType === 'delivery' ? 'Entrega em domicílio' : 'Retirada na loja'}
              {order.address ? ` — ${order.address}` : ''}
            </p>
          )}
          {order.notes && <p className="muted">Obs: {order.notes}</p>}
        </Card>

        {order.items && order.items.length > 0 && (
          <Card title="Itens do pedido" subtitle="Resumo do que foi pedido" variant="layered">
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
                <strong>{formatCurrency(order.subtotal ?? order.total)}</strong>
              </div>
              {order.deliveryFee != null && order.deliveryFee > 0 && (
                <div className="inline-info">
                  <span className="muted">Entrega</span>
                  <strong>{formatCurrency(order.deliveryFee)}</strong>
                </div>
              )}
              {order.couponCode && order.discountTotal != null && order.discountTotal > 0 && (
                <div className="inline-info">
                  <span className="muted" style={{ color: 'var(--color-success, #16a34a)' }}>
                    Desconto ({order.couponCode})
                  </span>
                  <strong style={{ color: 'var(--color-success, #16a34a)' }}>
                    -{formatCurrency(order.discountTotal)}
                  </strong>
                </div>
              )}
              <div className="inline-info">
                <strong>Total</strong>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
          </Card>
        )}

        <Card title="Próximos passos" subtitle="O que acontece agora?" variant="layered">
          <div className="stack" style={{ gap: '0.75rem' }}>

            {isPixPayment && order.paymentStatus !== 'paid' && (
              <>
                {order.pixKey && (
                  <div className="stack" style={{ gap: '0.35rem' }}>
                    <p className="muted" style={{ margin: 0 }}>
                      <strong>Chave Pix:</strong>
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--color-surface-raised, #f9fafb)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                    }}>
                      <code style={{ flex: 1, fontSize: '0.9rem', wordBreak: 'break-all' }}>{order.pixKey}</code>
                      <CopyButton text={order.pixKey} label="Copiar chave Pix" />
                    </div>
                  </div>
                )}
                {order.paymentInstructions && (
                  <p className="muted">{order.paymentInstructions}</p>
                )}
                <p className="muted">
                  O lojista confirmará o pagamento manualmente.
                </p>
              </>
            )}

            {isExternalLink && order.paymentStatus !== 'paid' && (
              <>
                {externalPaymentUrl ? (
                  <a href={externalPaymentUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="store" storeColor={storeTheme.primaryColor}>
                      Abrir link de pagamento
                    </Button>
                  </a>
                ) : (
                  <p className="muted">
                    Entre em contato com a loja para receber o link de pagamento.
                  </p>
                )}
                <p className="muted" style={{ fontSize: '0.85rem' }}>
                  ⚠️ O pagamento acontece fora da plataforma.
                </p>
              </>
            )}

            {isWhatsappPayment && (
              <>
                <p className="muted">
                  <strong>Pagamento pelo WhatsApp:</strong> combine o pagamento diretamente com a loja.
                </p>
                {whatsappPaymentUrl ? (
                  <a href={whatsappPaymentUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="store" storeColor={storeTheme.primaryColor}>
                      Chamar loja no WhatsApp
                    </Button>
                  </a>
                ) : (
                  <p className="muted">Entre em contato com a loja para combinar o pagamento.</p>
                )}
              </>
            )}

            {isPaymentArranged && !isWhatsappPayment && (
              <p className="muted">
                <strong>Pagamento a combinar:</strong> entre em contato com a loja para acertar a forma de pagamento antes da entrega.
              </p>
            )}

            {!isPixPayment && !isExternalLink && !isWhatsappPayment && !isPaymentArranged && (
              <p className="muted">
                Aguardando pagamento conforme combinado. A loja recebeu seu pedido e em breve confirmará.
              </p>
            )}

            {whatsappContactUrl && !isWhatsappPayment && (
              <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">
                  Falar com a loja pelo WhatsApp
                </Button>
              </a>
            )}

            <Link to={`/loja/${slug}`}>
              <Button variant="secondary">Continuar comprando</Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}
