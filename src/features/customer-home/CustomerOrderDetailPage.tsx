import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { buildOrderTimeline, createOrUpdateReview, derivePaymentMethodKey, getOrderWithStore, getReviewByOrder } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, OrderPaymentMethod, OrderStatus, PaymentStatus, Store } from '../../types'
import type { StoreReview } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { OrderTimeline } from '../orders/components/OrderTimeline'

const REVIEW_TAGS = [
  'Atendimento rápido',
  'Produto bom',
  'Entrega boa',
  'Preço justo',
  'Demorou',
  'Produto diferente',
  'Atendimento ruim',
  'Problema na entrega',
]

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
  const [review, setReview] = useState<StoreReview | undefined>()
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewTags, setReviewTags] = useState<string[]>([])
  const [reviewSaved, setReviewSaved] = useState(false)
  const [reviewEditing, setReviewEditing] = useState(false)

  useEffect(() => {
    getOrderWithStore(orderId).then((result) => {
      if (result) {
        setOrder(result.order)
        setStore(result.store)
      }
    })
    getReviewByOrder(orderId).then((existing) => {
      if (existing) {
        setReview(existing)
        setReviewRating(existing.rating)
        setReviewComment(existing.comment ?? '')
        setReviewTags(existing.tags ?? [])
      }
    })
  }, [orderId])

  const handleToggleTag = (tag: string) => {
    setReviewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const handleSaveReview = async () => {
    if (!order || reviewRating < 1) return
    const saved = await createOrUpdateReview({
      storeId: order.store_id,
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
      tags: reviewTags.length ? reviewTags : undefined,
    })
    setReview(saved)
    setReviewEditing(false)
    setReviewSaved(true)
    setTimeout(() => setReviewSaved(false), 3000)
  }

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

        {/* Review block */}
        {order.status === 'delivered' ? (
          <Card
            title={review && !reviewEditing ? 'Sua avaliação' : 'Avaliar pedido'}
            subtitle={review && !reviewEditing ? 'Obrigado pelo seu feedback!' : 'Como foi a sua experiência?'}
            variant="layered"
          >
            {review && !reviewEditing ? (
              <div className="stack" style={{ gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{ fontSize: '1.5rem', color: star <= review.rating ? '#f59e0b' : 'var(--color-border)' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {review.tags && review.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          background: 'var(--color-surface-raised, #f3f4f6)',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {review.comment && <p className="muted" style={{ margin: 0 }}>{review.comment}</p>}
                {reviewSaved && (
                  <p style={{ color: 'var(--color-success, #16a34a)', margin: 0, fontSize: '0.88rem' }}>
                    ✓ Avaliação salva!
                  </p>
                )}
                <Button variant="secondary" size="sm" onClick={() => setReviewEditing(true)}>
                  Editar avaliação
                </Button>
              </div>
            ) : (
              <div className="stack" style={{ gap: '0.75rem' }}>
                <div>
                  <p className="muted" style={{ margin: '0 0 0.4rem', fontSize: '0.88rem' }}>Nota:</p>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.1rem',
                          fontSize: '2rem',
                          color: star <= reviewRating ? '#f59e0b' : 'var(--color-border)',
                          lineHeight: 1,
                        }}
                        aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="muted" style={{ margin: '0 0 0.4rem', fontSize: '0.88rem' }}>Tags rápidas:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {REVIEW_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          border: `1px solid ${reviewTags.includes(tag) ? 'var(--color-accent, #3A86FF)' : 'var(--color-border)'}`,
                          background: reviewTags.includes(tag) ? 'var(--color-accent, #3A86FF)' : 'transparent',
                          color: reviewTags.includes(tag) ? '#fff' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="muted" style={{ margin: '0 0 0.4rem', fontSize: '0.88rem' }}>Comentário (opcional):</p>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte como foi sua experiência..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-raised, #f9fafb)',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {reviewSaved && (
                  <p style={{ color: 'var(--color-success, #16a34a)', margin: 0, fontSize: '0.88rem' }}>
                    ✓ Avaliação salva!
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="accent"
                    onClick={handleSaveReview}
                    disabled={reviewRating < 1}
                  >
                    Salvar avaliação
                  </Button>
                  {reviewEditing && (
                    <Button variant="secondary" onClick={() => setReviewEditing(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ) : (
          order.status !== 'cancelled' && (
            <Card title="Avaliação" subtitle="" variant="layered">
              <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                Você poderá avaliar este pedido após a entrega.
              </p>
            </Card>
          )
        )}
      </div>
    </section>
  )
}
