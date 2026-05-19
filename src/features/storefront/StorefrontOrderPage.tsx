import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { buildOrderTimeline, getOrderById, getStoreBySlug, derivePaymentMethodKey } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, OrderPaymentMethod, OrderStatus, PaymentStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { buildPublicUrl } from '../../utils/publicUrl'
import { shareOrCopy } from '../../utils/share'
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

function shortOrderId(id: string): string {
  return id.slice(-8).toUpperCase()
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
        <p style={{ fontSize: '0.8rem', color: 'var(--danger, #dc2626)', margin: 0 }}>
          Não foi possível copiar. Copie manualmente.
        </p>
      )}
    </div>
  )
}

function getNextStepText(
  order: Order,
  isPixPayment: boolean,
  isWhatsappPayment: boolean,
  isExternalLink: boolean,
  isPaymentArranged: boolean,
): string {
  if (order.status === 'delivered') return 'Pedido entregue. Você pode avaliar sua experiência.'
  if (order.status === 'cancelled') return 'Pedido cancelado.'
  if (order.status === 'preparing') return 'A loja está preparando seu pedido.'
  if (isPixPayment && order.paymentStatus !== 'paid') return 'Faça o Pix e aguarde a confirmação da loja.'
  if (isWhatsappPayment) return 'Chame a loja para combinar o pagamento.'
  if (isExternalLink && order.paymentStatus !== 'paid') return 'Abra o link de pagamento quando a loja disponibilizar.'
  if (isPaymentArranged) return 'Combine o pagamento com a loja.'
  return 'Aguarde a loja confirmar seu pedido.'
}

export function StorefrontOrderPage() {
  const { slug = '', orderId = '' } = useParams()
  const [store, setStore] = useState<Store | undefined>()
  const [order, setOrder] = useState<Order | undefined>()
  const [shareFeedback, setShareFeedback] = useState<'shared' | 'copied' | 'cancelled' | 'failed' | null>(null)

  const SHARE_FEEDBACK_MESSAGES = {
    shared: '🔗 Compartilhamento aberto',
    copied: '✅ Link copiado!',
    cancelled: 'Compartilhamento cancelado',
    failed: 'Não foi possível compartilhar',
  }

  const handleShareStore = async (currentStore: Store) => {
    const url = buildPublicUrl(`/loja/${currentStore.slug}`)
    const result = await shareOrCopy({
      title: currentStore.name,
      text: `Acabei de conhecer a ${currentStore.name}. Veja a vitrine:`,
      url,
    })
    setShareFeedback(result)
    setTimeout(() => setShareFeedback(null), 3000)
  }

  useEffect(() => {
    getStoreBySlug(slug).then(setStore)
    getOrderById(orderId).then(setOrder)
  }, [slug, orderId])

  if (!order || !store) {
    return (
      <section className="stack-lg container">
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
  const primaryColor = storeTheme.primaryColor ?? 'var(--primary)'

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

  const timeline = buildOrderTimeline(order)
  const timelineHasOnlyCreated = timeline.length === 1

  const nextStepText = getNextStepText(order, isPixPayment, isWhatsappPayment, isExternalLink, isPaymentArranged)

  const needsStickyAction =
    order.status !== 'cancelled' &&
    order.status !== 'delivered' &&
    (
      (isPixPayment && order.paymentStatus !== 'paid' && !!order.pixKey) ||
      (isWhatsappPayment && !!whatsappPaymentUrl) ||
      (isExternalLink && order.paymentStatus !== 'paid' && !!externalPaymentUrl)
    )

  return (
    <section className="order-confirmed-shell">
      {/* ── Hero ── */}
      <div
        className="order-confirmed-hero"
        style={{ '--order-hero-color': primaryColor } as React.CSSProperties}
      >
        <div className="order-confirmed-hero-icon">✅</div>
        <h1 className="order-confirmed-hero-title">Pedido recebido</h1>
        <p className="order-confirmed-hero-sub">
          A <strong>{store.name}</strong> recebeu seu pedido.
        </p>
        <p className="order-confirmed-hero-id">Pedido #{shortOrderId(order.id)}</p>
        <div className="order-confirmed-hero-meta">
          <span className="order-confirmed-hero-total">{formatCurrency(order.total)}</span>
          <span className="order-confirmed-hero-date">
            {new Date(order.createdAt).toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="order-confirmed-hero-badges">
          <Badge variant={getStatusVariant(order.status)}>{statusLabel[order.status]}</Badge>
          <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
            {paymentStatusLabel[order.paymentStatus]}
          </Badge>
        </div>
      </div>

      <div className="container stack-xl" style={{ paddingTop: '1.5rem', paddingBottom: needsStickyAction ? '5rem' : '2rem' }}>

        {/* ── Próximo passo ── */}
        <div className="order-next-step-card">
          <p className="order-next-step-label">Próximo passo</p>
          <p className="order-next-step-text">{nextStepText}</p>
          <div className="order-next-step-action">
            {isPixPayment && order.paymentStatus !== 'paid' && order.pixKey && (
              <CopyButton text={order.pixKey} label="💠 Copiar chave Pix" />
            )}
            {isWhatsappPayment && whatsappPaymentUrl && (
              <a href={whatsappPaymentUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="store" storeColor={storeTheme.primaryColor}>💬 Chamar loja no WhatsApp</Button>
              </a>
            )}
            {isExternalLink && order.paymentStatus !== 'paid' && externalPaymentUrl && (
              <a href={externalPaymentUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="store" storeColor={storeTheme.primaryColor}>🔗 Abrir link de pagamento</Button>
              </a>
            )}
            {order.status === 'delivered' && (
              <Link to={`/cliente/pedidos/${order.id}`}>
                <Button variant="accent">⭐ Avaliar pedido</Button>
              </Link>
            )}
            {order.status === 'cancelled' && (
              <Link to={`/loja/${slug}`}>
                <Button variant="secondary">Continuar comprando</Button>
              </Link>
            )}
            {!isPixPayment && !isWhatsappPayment && !isExternalLink &&
              order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Link to="/cliente/pedidos">
                <Button variant="secondary">Ver meus pedidos</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid">

          {/* ── Pagamento ── */}
          {(isPixPayment || isWhatsappPayment || isExternalLink || isPaymentArranged) && (
            <Card title="Pagamento" subtitle="Como pagar" variant="layered">
              <div className="stack" style={{ gap: '0.75rem' }}>

                {isPixPayment && order.paymentStatus !== 'paid' && (
                  <>
                    {order.pixKey && (
                      <div className="order-pix-block">
                        <p className="order-pix-label">Chave Pix</p>
                        <div className="order-pix-key-row">
                          <code className="order-pix-key">{order.pixKey}</code>
                          <CopyButton text={order.pixKey} label="Copiar" />
                        </div>
                      </div>
                    )}
                    {order.paymentInstructions && (
                      <p className="muted" style={{ margin: 0 }}>{order.paymentInstructions}</p>
                    )}
                    <p className="order-payment-note">
                      🔒 Pagamento confirmado manualmente pelo lojista.
                    </p>
                  </>
                )}

                {isPixPayment && order.paymentStatus === 'paid' && (
                  <p className="order-payment-note order-payment-note--success">
                    ✅ Pagamento confirmado.
                  </p>
                )}

                {isExternalLink && order.paymentStatus !== 'paid' && (
                  <>
                    {externalPaymentUrl ? (
                      <a href={externalPaymentUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <Button variant="store" storeColor={storeTheme.primaryColor} style={{ width: '100%' }}>
                          🔗 Abrir link de pagamento
                        </Button>
                      </a>
                    ) : (
                      <p className="muted" style={{ margin: 0 }}>
                        Entre em contato com a loja para receber o link de pagamento.
                      </p>
                    )}
                    <p className="order-payment-note">
                      ⚠️ Pagamento fora da plataforma.
                    </p>
                  </>
                )}

                {isWhatsappPayment && (
                  <>
                    <p className="muted" style={{ margin: 0 }}>
                      Combine o pagamento diretamente com a loja.
                    </p>
                    {whatsappPaymentUrl ? (
                      <a href={whatsappPaymentUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <Button variant="store" storeColor={storeTheme.primaryColor} style={{ width: '100%' }}>
                          💬 Chamar loja no WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <p className="muted" style={{ margin: 0 }}>Entre em contato com a loja para combinar.</p>
                    )}
                  </>
                )}

                {isPaymentArranged && !isWhatsappPayment && (
                  <>
                    <p className="muted" style={{ margin: 0 }}>
                      Entre em contato com a loja para acertar a forma de pagamento.
                    </p>
                    {whatsappContactUrl && (
                      <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <Button variant="secondary" style={{ width: '100%' }}>
                          💬 Falar com a loja
                        </Button>
                      </a>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}

          {/* ── Como receber ── */}
          {order.deliveryType && (
            <Card title="Como receber" subtitle="Entrega ou retirada" variant="layered">
              <div className="stack" style={{ gap: '0.6rem' }}>
                {order.deliveryType === 'delivery' && (
                  <>
                    <div className="order-delivery-row">
                      <span className="order-delivery-icon">🛵</span>
                      <div>
                        <p className="order-delivery-type">Entrega em domicílio</p>
                        {order.address && (
                          <p className="order-delivery-detail">{order.address}</p>
                        )}
                        {order.estimatedMinutes != null && order.estimatedMinutes > 0 && (
                          <p className="order-delivery-detail">⏱ Tempo estimado: ~{order.estimatedMinutes} min</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {order.deliveryType === 'pickup' && (
                  <div className="order-delivery-row">
                    <span className="order-delivery-icon">🏪</span>
                    <div>
                      <p className="order-delivery-type">Retirada no local</p>
                      {order.pickupAddress && (
                        <p className="order-delivery-detail">{order.pickupAddress}</p>
                      )}
                    </div>
                  </div>
                )}
                {order.deliveryType === 'arrange' && (
                  <div className="order-delivery-row">
                    <span className="order-delivery-icon">💬</span>
                    <div>
                      <p className="order-delivery-type">Entrega a combinar</p>
                      <p className="order-delivery-detail">
                        Combine a entrega com a loja pelo WhatsApp ou telefone.
                      </p>
                    </div>
                  </div>
                )}
                {order.orderPlacedWhileClosed && (
                  <p className="order-payment-note" style={{ marginTop: '0.25rem' }}>
                    ⏰ Pedido enviado fora do horário. A loja atenderá no próximo horário de funcionamento.
                  </p>
                )}
                {order.notes && (
                  <p className="muted" style={{ margin: 0, fontSize: '0.86rem' }}>Obs: {order.notes}</p>
                )}
              </div>
            </Card>
          )}

          {/* ── Itens do pedido ── */}
          {order.items && order.items.length > 0 && (
            <Card title="Itens do pedido" subtitle="Resumo do que foi pedido" variant="layered">
              <div className="stack" style={{ gap: '0.5rem' }}>
                {order.items.map((item) => (
                  <div key={item.product_id} className="order-item-row">
                    <div className="order-item-info">
                      <span className="order-item-name">{item.productName}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                    </div>
                    <strong className="order-item-subtotal">{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
                <hr className="order-divider" />
                <div className="inline-info">
                  <span className="muted">Subtotal</span>
                  <span>{formatCurrency(order.subtotal ?? order.total)}</span>
                </div>
                {order.deliveryFee != null && order.deliveryFee > 0 && (
                  <div className="inline-info">
                    <span className="muted">Entrega</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                {order.couponCode && order.discountTotal != null && order.discountTotal > 0 && (
                  <div className="inline-info">
                    <span style={{ color: 'var(--success)' }}>Desconto ({order.couponCode})</span>
                    <span style={{ color: 'var(--success)' }}>-{formatCurrency(order.discountTotal)}</span>
                  </div>
                )}
                <hr className="order-divider" />
                <div className="inline-info">
                  <strong style={{ fontSize: '1rem' }}>Total</strong>
                  <strong style={{ fontSize: '1.1rem' }}>{formatCurrency(order.total)}</strong>
                </div>
              </div>
            </Card>
          )}

          {/* ── Acompanhamento ── */}
          <Card title="Acompanhamento" subtitle="Veja o andamento do pedido." variant="layered">
            <OrderTimeline entries={timeline} />
            {timelineHasOnlyCreated && (
              <p className="order-timeline-hint">
                A próxima atualização aparecerá quando a loja movimentar o pedido.
              </p>
            )}
          </Card>

          {/* ── Ações finais ── */}
          <Card title="O que fazer agora?" subtitle="Próximas ações" variant="layered">
            <div className="stack" style={{ gap: '0.65rem' }}>
              <Link to="/cliente/pedidos">
                <Button variant="secondary" style={{ width: '100%' }}>📦 Acompanhar em meus pedidos</Button>
              </Link>
              {whatsappContactUrl && (
                <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                  <Button variant="secondary" style={{ width: '100%' }}>💬 Falar com a loja</Button>
                </a>
              )}
              <Link to={`/loja/${slug}`}>
                <Button variant="secondary" style={{ width: '100%' }}>🛍️ Continuar comprando</Button>
              </Link>

              <div className="order-share-row">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShareStore(store)}
                  style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}
                >
                  🔗 Compartilhar loja
                </Button>
                {shareFeedback && (
                  <p style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: shareFeedback === 'failed' ? 'var(--danger)' : 'var(--text-secondary)',
                  }}>
                    {SHARE_FEEDBACK_MESSAGES[shareFeedback]}
                  </p>
                )}
              </div>

              {order.status === 'delivered' && (
                <Link to={`/cliente/pedidos/${order.id}`}>
                  <Button variant="accent" style={{ width: '100%' }}>⭐ Avaliar pedido</Button>
                </Link>
              )}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <p className="muted" style={{ fontSize: '0.84rem', margin: 0, textAlign: 'center' }}>
                  Após a entrega, você poderá avaliar sua experiência.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Sticky bottom bar (mobile) ── */}
      {needsStickyAction && (
        <div className="order-sticky-bar">
          {isPixPayment && order.paymentStatus !== 'paid' && order.pixKey && (
            <CopyButton text={order.pixKey} label="💠 Copiar Pix" />
          )}
          {isWhatsappPayment && whatsappPaymentUrl && (
            <a href={whatsappPaymentUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
              <Button variant="store" storeColor={storeTheme.primaryColor} style={{ width: '100%' }}>
                💬 Chamar loja
              </Button>
            </a>
          )}
          {isExternalLink && order.paymentStatus !== 'paid' && externalPaymentUrl && (
            <a href={externalPaymentUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
              <Button variant="store" storeColor={storeTheme.primaryColor} style={{ width: '100%' }}>
                🔗 Abrir pagamento
              </Button>
            </a>
          )}
        </div>
      )}
    </section>
  )
}
