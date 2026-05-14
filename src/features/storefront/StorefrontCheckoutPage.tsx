import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { SectionHeader } from '../../components/ui/SectionHeader'
import {
  createOrderFromCart,
  getCartItemsByStore,
  getDeliverySettings,
  getPaymentSettings,
  getStoreBySlug,
  validateCoupon,
} from '../../services/mockData'
import type { ValidateCouponResult } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { CartItem, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import type { DeliverySettings, PaymentMethod } from '../../services/localMockStore'

function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      style={{
        border: selected ? '2px solid var(--color-accent, #3A86FF)' : '1.5px solid var(--color-border)',
        borderRadius: '0.75rem',
        padding: '0.85rem 1rem',
        cursor: 'pointer',
        background: selected ? 'var(--color-accent-subtle, #f0f7ff)' : 'var(--color-surface, #fff)',
        outline: 'none',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: method.instructions || method.pixKey ? '0.35rem' : 0 }}>
        {method.name}
      </div>

      {method.type === 'pix' && (
        <>
          {method.pixKey && (
            <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>
              Chave Pix: <strong>{method.pixKey}</strong>
            </p>
          )}
          {method.instructions && (
            <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{method.instructions}</p>
          )}
          <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
            Após o pagamento, aguarde a confirmação do lojista.
          </p>
        </>
      )}

      {method.type === 'external_payment_link' && (
        <>
          {method.instructions && (
            <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{method.instructions}</p>
          )}
          <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
            ⚠️ O pagamento será feito fora da plataforma. O link será disponibilizado após confirmar o pedido.
          </p>
        </>
      )}

      {method.type === 'whatsapp' && (
        <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>
          Você poderá chamar a loja após confirmar o pedido.
        </p>
      )}

      {method.type === 'cash' && (
        <>
          {method.instructions && (
            <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{method.instructions}</p>
          )}
          {!method.instructions && (
            <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>
              Pague na entrega ou retirada, conforme combinado com a loja.
            </p>
          )}
        </>
      )}

      {(method.type === 'card_on_delivery' || method.type === 'pickup_payment') && method.instructions && (
        <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{method.instructions}</p>
      )}
    </div>
  )
}

export function StorefrontCheckoutPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | undefined>()
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | undefined>()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [couponInput, setCouponInput] = useState('')
  const [couponResult, setCouponResult] = useState<ValidateCouponResult | null>(null)
  const [couponApplied, setCouponApplied] = useState(false)

  useEffect(() => {
    getStoreBySlug(slug).then((nextStore) => {
      setStore(nextStore)
      if (!nextStore) return
      getCartItemsByStore(nextStore.id).then(setItems)
      getPaymentSettings(nextStore.id).then((methods) => {
        const enabled = methods.filter((m) => m.enabled)
        setPaymentMethods(enabled)
        if (enabled.length > 0) setSelectedPaymentId(enabled[0].id)
      })
      getDeliverySettings(nextStore.id).then((settings) => {
        setDeliverySettings(settings)
        if (settings?.deliveryEnabled && !settings?.pickupEnabled) {
          setDeliveryType('delivery')
        } else {
          setDeliveryType('pickup')
        }
      })
    })
  }, [slug])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const deliveryFee = deliveryType === 'delivery' && deliverySettings?.deliveryEnabled ? deliverySettings.fee : 0
  const discountAmount = couponApplied && couponResult?.valid ? couponResult.discountAmount : 0
  const total = Math.max(0, subtotal + deliveryFee - discountAmount)

  const storeTheme = getStoreTheme(store)
  const selectedMethod = paymentMethods.length === 1
    ? paymentMethods[0]
    : paymentMethods.find((m) => m.id === selectedPaymentId)

  const handleApplyCoupon = async () => {
    if (!store || !couponInput.trim()) return
    const result = await validateCoupon(store.id, couponInput.trim(), subtotal)
    setCouponResult(result)
    setCouponApplied(result.valid)
  }

  const handleRemoveCoupon = () => {
    setCouponInput('')
    setCouponResult(null)
    setCouponApplied(false)
  }

  const handleConfirm = async () => {
    if (!store) return
    if (!customerName.trim()) {
      setErrorMessage('Informe seu nome para continuar.')
      return
    }
    if (!selectedMethod) {
      setErrorMessage('Selecione uma forma de pagamento.')
      return
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      setErrorMessage('Informe o endereço de entrega.')
      return
    }
    if (items.length === 0) {
      setErrorMessage('Seu carrinho está vazio.')
      return
    }

    try {
      setErrorMessage('')
      setSubmitting(true)
      const order = await createOrderFromCart({
        storeId: store.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        address: deliveryType === 'delivery' ? address.trim() : undefined,
        notes: notes.trim() || undefined,
        deliveryType,
        paymentMethod: selectedMethod.name,
        paymentMethodKey: selectedMethod.type,
        paymentInstructions: selectedMethod.instructions || undefined,
        externalPaymentUrl: selectedMethod.externalUrl || undefined,
        pixKey: selectedMethod.pixKey || undefined,
        couponCode: couponApplied && couponResult?.valid ? couponResult.coupon.code : undefined,
        deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
      })
      navigate(`/loja/${slug}/pedido/${order.id}`)
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      setErrorMessage('Não foi possível criar o pedido. Tente novamente.')
      setSubmitting(false)
    }
  }

  if (!store) {
    return (
      <section className="stack-lg container">
        <SectionHeader kicker="Checkout" icon="check" title="Loja não encontrada" description="" />
      </section>
    )
  }

  return (
    <section className="stack-xl container">
      <SectionHeader
        kicker="Checkout"
        icon="check"
        title={`Finalizar pedido — ${store.name}`}
        description="Preencha seus dados e confirme o pedido."
      />

      <div className="grid">
        <Card title="Itens do pedido" subtitle="Resumo da sua seleção" variant="accentCorner">
          <div className="stack" style={{ gap: '0.6rem' }}>
            {items.map((item) => (
              <div key={item.id} className="inline-info">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
            <div className="inline-info">
              <span className="muted">Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            {deliveryType === 'delivery' && deliverySettings?.deliveryEnabled && (
              <div className="inline-info">
                <span className="muted">
                  Entrega (~{deliverySettings.estimatedMinutes} min)
                </span>
                <strong>{formatCurrency(deliverySettings.fee)}</strong>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="inline-info">
                <span className="muted" style={{ color: 'var(--color-success, #16a34a)' }}>
                  Desconto ({couponResult?.valid ? couponResult.coupon.code : ''})
                </span>
                <strong style={{ color: 'var(--color-success, #16a34a)' }}>
                  -{formatCurrency(discountAmount)}
                </strong>
              </div>
            )}
            <div className="inline-info">
              <span>
                <strong>Total</strong>
              </span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </Card>

        <Card title="Cupom de desconto" subtitle="Tem um cupom? Aplique aqui" variant="layered">
          {couponApplied && couponResult?.valid ? (
            <div className="stack" style={{ gap: '0.5rem' }}>
              <p style={{ color: 'var(--color-success, #16a34a)', fontWeight: 600 }}>
                ✅ Cupom <strong>{couponResult.coupon.code}</strong> aplicado — {formatCurrency(couponResult.discountAmount)} de desconto
              </p>
              <Button variant="ghost" onClick={handleRemoveCoupon}>
                Remover cupom
              </Button>
            </div>
          ) : (
            <div className="stack" style={{ gap: '0.5rem' }}>
              <div className="inline-info">
                <Input
                  label=""
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Ex: BEMVINDO10"
                  style={{ flex: 1 }}
                />
                <Button variant="secondary" onClick={handleApplyCoupon} disabled={!couponInput.trim()}>
                  Aplicar
                </Button>
              </div>
              {couponResult && !couponResult.valid && (
                <p className="error-text">{couponResult.error}</p>
              )}
            </div>
          )}
        </Card>

        {(deliverySettings?.deliveryEnabled || deliverySettings?.pickupEnabled) && (
          <Card title="Entrega ou retirada" subtitle="Escolha como receber seu pedido" variant="layered">
            <div className="stack" style={{ gap: '0.5rem' }}>
              {deliverySettings.pickupEnabled && (
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === 'pickup'}
                    onChange={() => setDeliveryType('pickup')}
                  />
                  Retirar na loja
                </label>
              )}
              {deliverySettings.deliveryEnabled && (
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={deliveryType === 'delivery'}
                    onChange={() => setDeliveryType('delivery')}
                  />
                  Receber em casa (+{formatCurrency(deliverySettings.fee)})
                </label>
              )}
            </div>
          </Card>
        )}

        {paymentMethods.length > 0 && (
          <Card title="Pagamento" subtitle="Como esta loja recebe" variant="layered">
            <div className="stack" style={{ gap: '0.65rem' }}>
              {paymentMethods.length === 1 ? (
                <PaymentMethodCard
                  method={paymentMethods[0]}
                  selected={true}
                  onSelect={() => {}}
                />
              ) : (
                paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    selected={selectedPaymentId === method.id}
                    onSelect={() => setSelectedPaymentId(method.id)}
                  />
                ))
              )}
              <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                O pedido será registrado no app. O pagamento é confirmado manualmente pelo lojista.
              </p>
            </div>
          </Card>
        )}

        <Card title="Seus dados" subtitle="Para o lojista entrar em contato" variant="accentCorner">
          <div className="stack" style={{ gap: '0.75rem' }}>
            <Input
              label="Nome completo"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="Telefone / WhatsApp"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(11) 99999-0000"
            />
            {deliveryType === 'delivery' && (
              <Input
                label="Endereço de entrega"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            )}
            <Input
              label="Observação (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, portão azul..."
            />
          </div>
        </Card>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="store"
          size="lg"
          storeColor={storeTheme.primaryColor}
          onClick={handleConfirm}
          disabled={submitting}
        >
          <Icon name="check" className="icon-sm" />
          {submitting ? 'Confirmando…' : 'Confirmar pedido'}
        </Button>
      </div>
    </section>
  )
}
