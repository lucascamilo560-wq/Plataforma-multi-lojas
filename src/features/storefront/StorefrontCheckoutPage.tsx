import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import {
  createOrderFromCart,
  getCartItemsByStore,
  getCustomerProfile,
  getDeliverySettings,
  getPaymentSettings,
  getStoreBySlug,
  isCustomerProfileComplete,
  validateCoupon,
} from '../../services/mockData'
import type { CustomerProfile, ValidateCouponResult } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import { getStoreOpenStatus } from '../../utils/storeStatus'
import type { CartItem, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import type { DeliverySettings, PaymentMethod } from '../../services/localMockStore'

type DeliveryMode = 'pickup' | 'delivery' | 'arrange'

const PAYMENT_ICONS: Record<string, string> = {
  pix: '💠',
  cash: '💵',
  card_on_delivery: '💳',
  pickup_payment: '🏪',
  whatsapp: '💬',
  external_payment_link: '🔗',
}

function PaymentMethodCard({
  method,
  selected,
  onSelect,
  storeColor,
}: {
  method: PaymentMethod
  selected: boolean
  onSelect: () => void
  storeColor?: string
}) {
  const icon = PAYMENT_ICONS[method.type] ?? '💳'
  const cardClass = [
    'checkout-payment-card',
    selected ? 'checkout-payment-card--selected' : 'checkout-payment-card--default',
  ].join(' ')

  const selectedStyle = selected && storeColor
    ? ({
        '--store-primary': storeColor,
        borderColor: storeColor,
        background: `color-mix(in srgb, ${storeColor} 6%, var(--surface))`,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${storeColor} 15%, transparent)`,
      } as React.CSSProperties)
    : undefined

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cardClass}
      style={selectedStyle}
    >
      <div className="checkout-payment-header">
        <span className="checkout-payment-icon">{icon}</span>
        <span className="checkout-payment-name">{method.name}</span>
        {selected && (
          <span
            className="checkout-payment-check"
            style={storeColor ? { background: storeColor } : undefined}
          >
            ✓
          </span>
        )}
      </div>

      {selected && (
        <div className="checkout-payment-details">
          {method.type === 'pix' && (
            <>
              {method.pixKey && (
                <p className="checkout-payment-pix-key">
                  Chave Pix: <strong>{method.pixKey}</strong>
                </p>
              )}
              {method.instructions && (
                <p className="checkout-payment-instruction">{method.instructions}</p>
              )}
              <p className="checkout-payment-notice">
                ℹ️ Após enviar o comprovante, aguarde a confirmação do lojista.
              </p>
            </>
          )}

          {method.type === 'external_payment_link' && (
            <>
              {method.instructions && (
                <p className="checkout-payment-instruction">{method.instructions}</p>
              )}
              <div className="checkout-payment-ext-warn">
                ⚠️ O pagamento é feito fora da plataforma. O link será fornecido após a confirmação do pedido.
              </div>
            </>
          )}

          {method.type === 'whatsapp' && (
            <p className="checkout-payment-instruction">
              💬 Combine o pagamento com a loja pelo WhatsApp após confirmar o pedido.
            </p>
          )}

          {method.type === 'cash' && (
            <p className="checkout-payment-instruction">
              {method.instructions ?? 'Pague na entrega ou retirada, conforme combinado com a loja.'}
            </p>
          )}

          {(method.type === 'card_on_delivery' || method.type === 'pickup_payment') && (
            <p className="checkout-payment-instruction">
              {method.instructions ?? 'Pague com cartão na entrega ou retirada.'}
            </p>
          )}

          <p className="checkout-payment-notice">
            🔒 O pagamento é confirmado manualmente pelo lojista.
          </p>
        </div>
      )}
    </div>
  )
}

function DeliveryModeCard({
  icon,
  title,
  subtitle,
  selected,
  onSelect,
  disabled,
  disabledReason,
  storeColor,
  children,
}: {
  icon: string
  title: string
  subtitle: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  disabledReason?: string
  storeColor?: string
  children?: React.ReactNode
}) {
  let cardClass = 'checkout-delivery-card '
  if (disabled) cardClass += 'checkout-delivery-card--disabled'
  else if (selected) cardClass += 'checkout-delivery-card--selected'
  else cardClass += 'checkout-delivery-card--default'

  const selectedStyle = selected && !disabled && storeColor
    ? ({
        '--store-primary': storeColor,
        borderColor: storeColor,
        background: `color-mix(in srgb, ${storeColor} 6%, var(--surface))`,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${storeColor} 15%, transparent)`,
      } as React.CSSProperties)
    : undefined

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => !disabled && e.key === 'Enter' && onSelect()}
      className={cardClass}
      style={selectedStyle}
    >
      <div className="checkout-delivery-inner">
        <span className="checkout-delivery-icon">{icon}</span>
        <div className="checkout-delivery-body">
          <div className="checkout-delivery-title-row">
            <span className="checkout-delivery-title">{title}</span>
            {selected && !disabled && (
              <span
                className="checkout-delivery-badge"
                style={storeColor ? { background: storeColor } : undefined}
              >
                Selecionado
              </span>
            )}
          </div>
          <p className="checkout-delivery-sub">{subtitle}</p>
          {disabled && disabledReason && (
            <p className="checkout-delivery-reason">❌ {disabledReason}</p>
          )}
          {selected && children && (
            <div style={{ marginTop: '0.5rem' }}>{children}</div>
          )}
        </div>
        {selected && !disabled && (
          <span
            className="checkout-delivery-check"
            style={storeColor ? { background: storeColor } : undefined}
          >
            ✓
          </span>
        )}
      </div>
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

  const [customerName, setCustomerName] = useState(() => getCustomerProfile()?.fullName ?? '')
  const [customerPhone, setCustomerPhone] = useState(() => getCustomerProfile()?.phone ?? '')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup')
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [couponInput, setCouponInput] = useState('')
  const [couponResult, setCouponResult] = useState<ValidateCouponResult | null>(null)
  const [couponApplied, setCouponApplied] = useState(false)

  const [savedProfile] = useState<CustomerProfile | null>(() => getCustomerProfile())
  const [editingData, setEditingData] = useState(false)

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
        // Select the first available mode
        if (settings?.pickupEnabled) {
          setDeliveryMode('pickup')
        } else if (settings?.deliveryEnabled) {
          setDeliveryMode('delivery')
        } else if (settings?.combineDelivery) {
          setDeliveryMode('arrange')
        } else {
          setDeliveryMode('pickup') // no mode configured, default shown but not enforced
        }
      })
    })
  }, [slug])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const deliveryFee =
    deliveryMode === 'delivery' && deliverySettings?.deliveryEnabled ? (deliverySettings.fee ?? 0) : 0

  const discountAmount = couponApplied && couponResult?.valid ? couponResult.discountAmount : 0
  const total = Math.max(0, subtotal + deliveryFee - discountAmount)

  const minOrder = deliverySettings?.minOrder ?? 0
  const deliveryBlockedByMinOrder =
    deliveryMode === 'delivery' &&
    deliverySettings?.deliveryEnabled &&
    minOrder > 0 &&
    subtotal < minOrder

  const storeTheme = getStoreTheme(store)
  const storeOpenStatus = store ? getStoreOpenStatus(store) : null
  const selectedMethod = paymentMethods.length === 1
    ? paymentMethods[0]
    : paymentMethods.find((m) => m.id === selectedPaymentId)

  const hasAnyDelivery =
    deliverySettings?.pickupEnabled ||
    deliverySettings?.deliveryEnabled ||
    deliverySettings?.combineDelivery

  const profileComplete = isCustomerProfileComplete(savedProfile)

  const formattedProfileAddress = savedProfile
    ? [
        `${savedProfile.street}, ${savedProfile.number}${savedProfile.complement ? ` - ${savedProfile.complement}` : ''}`,
        savedProfile.neighborhood,
        `${savedProfile.city} - ${savedProfile.state}`,
        `CEP ${savedProfile.zipCode}`,
      ].join(', ')
    : ''

  const restoreProfileData = () => {
    if (savedProfile) {
      setCustomerName(savedProfile.fullName)
      setCustomerPhone(savedProfile.phone)
      setAddress('')
    }
    setEditingData(false)
  }

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
    // Block if store cannot accept orders
    if (storeOpenStatus && !storeOpenStatus.canAcceptOrders) {
      setErrorMessage('Esta loja está fechada no momento e não aceita pedidos fora do horário.')
      return
    }
    if (!profileComplete) {
      setErrorMessage('Complete seu perfil para confirmar o pedido.')
      return
    }
    const resolvedCustomerName = profileComplete && !editingData && savedProfile
      ? savedProfile.fullName
      : customerName.trim()
    const resolvedCustomerPhone = profileComplete && !editingData && savedProfile
      ? savedProfile.phone
      : customerPhone.trim()
    const resolvedAddress = deliveryMode === 'delivery'
      ? profileComplete && !editingData
        ? formattedProfileAddress
        : address.trim()
      : undefined

    if (!resolvedCustomerName) {
      setErrorMessage('Informe seu nome para continuar.')
      return
    }
    if (!selectedMethod) {
      setErrorMessage('Selecione uma forma de pagamento.')
      return
    }
    if (deliveryMode === 'delivery' && !resolvedAddress) {
      setErrorMessage('Informe o endereço de entrega.')
      return
    }
    if (deliveryBlockedByMinOrder) {
      setErrorMessage(`Pedido mínimo para entrega própria é ${formatCurrency(minOrder)}. Escolha retirada ou combinar entrega.`)
      return
    }
    if (items.length === 0) {
      setErrorMessage('Seu carrinho está vazio.')
      return
    }

    const placedWhileClosed = storeOpenStatus ? !storeOpenStatus.isOpenNow : false

    try {
      setErrorMessage('')
      setSubmitting(true)
      const order = await createOrderFromCart({
        storeId: store.id,
        customerName: resolvedCustomerName,
        customerPhone: resolvedCustomerPhone || undefined,
        address: resolvedAddress,
        notes: notes.trim() || undefined,
        deliveryType: deliveryMode,
        paymentMethod: selectedMethod.name,
        paymentMethodKey: selectedMethod.type,
        paymentInstructions: selectedMethod.instructions || undefined,
        externalPaymentUrl: selectedMethod.externalUrl || undefined,
        pixKey: selectedMethod.pixKey || undefined,
        couponCode: couponApplied && couponResult?.valid ? couponResult.coupon.code : undefined,
        deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
        pickupAddress:
          deliveryMode === 'pickup' && deliverySettings?.pickupAddress
            ? deliverySettings.pickupAddress
            : undefined,
        estimatedMinutes:
          deliveryMode === 'delivery' && deliverySettings?.estimatedMinutes
            ? deliverySettings.estimatedMinutes
            : undefined,
        orderPlacedWhileClosed: placedWhileClosed || undefined,
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
        <div className="checkout-header">
          <p className="checkout-header-kicker">Checkout</p>
          <h1 className="checkout-header-title">Finalizar pedido</h1>
          <p className="checkout-header-sub">Loja não encontrada.</p>
        </div>
      </section>
    )
  }

  // Steps state
  const stepSacola = items.length > 0
  const stepPerfil = profileComplete
  const stepEntrega = !!deliveryMode
  const stepPagamento = !!selectedMethod

  type StepState = 'done' | 'active' | 'pending'

  const steps: { label: string; state: StepState }[] = [
    { label: 'Sacola', state: stepSacola ? 'done' : 'active' },
    { label: 'Perfil', state: stepPerfil ? 'done' : (stepSacola ? 'active' : 'pending') },
    { label: 'Entrega', state: stepEntrega && stepPerfil ? 'done' : (stepPerfil ? 'active' : 'pending') },
    { label: 'Pagamento', state: stepPagamento && stepPerfil && stepEntrega ? 'done' : (stepPerfil && stepEntrega ? 'active' : 'pending') },
    { label: 'Confirmar', state: (stepSacola && stepPerfil && stepEntrega && stepPagamento) ? 'active' : 'pending' },
  ]

  const isOrderBlocked =
    submitting ||
    deliveryBlockedByMinOrder ||
    (storeOpenStatus !== null && !storeOpenStatus.canAcceptOrders)

  return (
    <section className="stack-xl container" style={{ paddingBottom: items.length > 0 ? '5.5rem' : undefined }}>

      {/* Premium checkout header */}
      <div className="checkout-header">
        <p className="checkout-header-kicker">Checkout</p>
        <h1 className="checkout-header-title">Finalizar pedido</h1>
        <p className="checkout-header-sub">
          {profileComplete
            ? 'Revise entrega, pagamento e confirme seu pedido.'
            : 'Complete seu perfil para confirmar a primeira compra.'}
        </p>
        <div className="checkout-header-meta">
          <span className="checkout-header-store">
            🏬 {store.name}
          </span>
          {storeOpenStatus && (
            <span className={`checkout-header-status ${storeOpenStatus.isOpenNow ? 'checkout-header-status--open' : 'checkout-header-status--closed'}`}>
              {storeOpenStatus.isOpenNow ? '● Aberta' : '● Fechada'}
            </span>
          )}
          {items.length > 0 && (
            <span className="checkout-header-total">
              Total: <strong>{formatCurrency(total)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Visual steps indicator */}
      <div className="checkout-steps">
        {steps.map((step, idx) => (
          <div key={step.label} className="checkout-step">
            <div className="checkout-step-dot">
              <div className={`checkout-step-circle checkout-step-circle--${step.state}`}>
                {step.state === 'done' ? '✓' : idx + 1}
              </div>
              <span className={`checkout-step-label checkout-step-label--${step.state}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`checkout-step-connector ${step.state === 'done' ? 'checkout-step-connector--done' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Store closed notice */}
      {storeOpenStatus && !storeOpenStatus.isOpenNow && (
        <div className={`checkout-closed-notice ${storeOpenStatus.canAcceptOrders ? 'checkout-closed-notice--warn' : 'checkout-closed-notice--block'}`}>
          <span className="checkout-closed-notice-icon">
            {storeOpenStatus.canAcceptOrders ? '⚠️' : '🚫'}
          </span>
          <div>
            <strong>{storeOpenStatus.statusLabel}</strong>
            {' — '}
            {storeOpenStatus.canAcceptOrders
              ? 'A loja está fechada agora. Seu pedido será atendido no próximo horário de funcionamento.'
              : 'Esta loja não aceita pedidos fora do horário de funcionamento.'}
            {storeOpenStatus.nextOpeningLabel && (
              <span style={{ display: 'block', fontSize: '0.82rem', marginTop: '0.2rem', opacity: 0.8 }}>
                {storeOpenStatus.nextOpeningLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty cart state */}
      {items.length === 0 ? (
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛍️</div>
          <p className="checkout-empty-title">Sua sacola está vazia</p>
          <p className="checkout-empty-sub">Adicione produtos antes de finalizar o pedido.</p>
          <div className="checkout-empty-actions">
            <Button
              variant="store"
              size="md"
              storeColor={storeTheme.primaryColor}
              onClick={() => navigate(`/loja/${slug}`)}
            >
              Ver produtos
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate(`/loja/${slug}`)}>
              Voltar para loja
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid">

            {/* Items do pedido */}
            <Card title="Itens do pedido" subtitle="Resumo da sua seleção" variant="accentCorner">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item) => (
                  <div key={item.id} className="checkout-item-row">
                    <div style={{ flex: 1 }}>
                      <p className="checkout-item-name">{item.productName}</p>
                      <p className="checkout-item-qty">{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <div>
                      <p className="checkout-item-price">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="checkout-summary-divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <div className="checkout-summary-row">
                  <span className="muted" style={{ fontSize: '0.875rem' }}>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                {deliveryMode === 'delivery' && deliverySettings?.deliveryEnabled && (
                  <div className="checkout-summary-row">
                    <span className="muted" style={{ fontSize: '0.875rem' }}>
                      Entrega {deliverySettings.estimatedMinutes ? `(~${deliverySettings.estimatedMinutes} min)` : ''}
                    </span>
                    <strong>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}</strong>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="checkout-summary-row">
                    <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}>
                      Desconto ({couponResult?.valid ? couponResult.coupon.code : ''})
                    </span>
                    <strong style={{ color: 'var(--success)' }}>-{formatCurrency(discountAmount)}</strong>
                  </div>
                )}
                <div className="checkout-summary-total-row">
                  <span className="checkout-summary-total-label">Total</span>
                  <span className="checkout-summary-total-value">{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>

            {/* Cupom */}
            <Card title="Cupom de desconto" subtitle="Tem um cupom? Aplique aqui" variant="layered">
              {couponApplied && couponResult?.valid ? (
                <div className="stack" style={{ gap: '0.5rem' }}>
                  <p style={{ color: 'var(--success)', fontWeight: 600 }}>
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

            {/* Entrega ou retirada */}
            {hasAnyDelivery && (
              <Card title="Entrega ou retirada" subtitle="Escolha como receber seu pedido" variant="layered">
                <div className="stack" style={{ gap: '0.75rem' }}>
                  {deliverySettings?.pickupEnabled && (
                    <DeliveryModeCard
                      icon="🏪"
                      title="Retirada no local"
                      subtitle={
                        deliverySettings.pickupAddress
                          ? `📍 ${deliverySettings.pickupAddress}`
                          : 'Retire diretamente na loja.'
                      }
                      selected={deliveryMode === 'pickup'}
                      onSelect={() => setDeliveryMode('pickup')}
                      storeColor={storeTheme.primaryColor}
                    />
                  )}

                  {deliverySettings?.deliveryEnabled && (
                    <DeliveryModeCard
                      icon="🛵"
                      title={`Entrega própria${deliverySettings.fee > 0 ? ` — +${formatCurrency(deliverySettings.fee)}` : ' — Grátis'}`}
                      subtitle={[
                        deliverySettings.estimatedMinutes ? `⏱ ~${deliverySettings.estimatedMinutes} min` : '',
                        deliverySettings.neighborhoods ? `🗺 ${deliverySettings.neighborhoods}` : '',
                      ]
                        .filter(Boolean)
                        .join('  •  ') || 'Entrega feita pela loja.'}
                      selected={deliveryMode === 'delivery'}
                      onSelect={() => setDeliveryMode('delivery')}
                      disabled={
                        deliveryMode !== 'delivery' &&
                        minOrder > 0 &&
                        subtotal < minOrder
                      }
                      disabledReason={
                        minOrder > 0 && subtotal < minOrder
                          ? `Pedido mínimo de ${formatCurrency(minOrder)} para entrega própria.`
                          : undefined
                      }
                      storeColor={storeTheme.primaryColor}
                    >
                      {deliveryBlockedByMinOrder && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--danger)', margin: 0 }}>
                          ❌ Subtotal abaixo do pedido mínimo ({formatCurrency(minOrder)}) para entrega própria.
                        </p>
                      )}
                    </DeliveryModeCard>
                  )}

                  {deliverySettings?.combineDelivery && (
                    <DeliveryModeCard
                      icon="💬"
                      title="Combinar entrega"
                      subtitle="Você combinará entrega com a loja após confirmar o pedido."
                      selected={deliveryMode === 'arrange'}
                      onSelect={() => setDeliveryMode('arrange')}
                      storeColor={storeTheme.primaryColor}
                    />
                  )}

                  {(deliverySettings?.deliveryNotes || (minOrder > 0 && deliverySettings?.deliveryEnabled)) && (
                    <div className="checkout-delivery-notes">
                      {minOrder > 0 && deliverySettings?.deliveryEnabled && (
                        <p style={{ margin: 0 }}>📦 Pedido mínimo para entrega própria: <strong>{formatCurrency(minOrder)}</strong></p>
                      )}
                      {deliverySettings?.deliveryNotes && (
                        <p style={{ margin: minOrder > 0 ? '0.3rem 0 0' : 0 }}>📝 {deliverySettings.deliveryNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Pagamento */}
            {paymentMethods.length > 0 && (
              <Card title="Pagamento" subtitle="Formas aceitas por esta loja" variant="layered">
                <div className="stack" style={{ gap: '0.65rem' }}>
                  {paymentMethods.length === 1 ? (
                    <PaymentMethodCard
                      method={paymentMethods[0]}
                      selected={true}
                      onSelect={() => {}}
                      storeColor={storeTheme.primaryColor}
                    />
                  ) : (
                    paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method}
                        selected={selectedPaymentId === method.id}
                        onSelect={() => setSelectedPaymentId(method.id)}
                        storeColor={storeTheme.primaryColor}
                      />
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Seus dados */}
            <Card title="Seus dados" subtitle="Para o lojista entrar em contato" variant="accentCorner">
              {!profileComplete ? (
                <div className="checkout-profile-incomplete">
                  <p className="checkout-profile-incomplete-title">
                    ⚠️ Perfil incompleto
                  </p>
                  <p className="checkout-profile-incomplete-sub">
                    Complete seu perfil para confirmar pedidos. Seus dados serão usados nesta e nas próximas compras.
                  </p>
                  <div className="checkout-profile-incomplete-list">
                    {!savedProfile?.fullName && (
                      <span>• Nome completo</span>
                    )}
                    {!savedProfile?.phone && (
                      <span>• Telefone / WhatsApp</span>
                    )}
                    {(!savedProfile?.street || !savedProfile?.number || !savedProfile?.neighborhood || !savedProfile?.city || !savedProfile?.state || !savedProfile?.zipCode) && (
                      <span>• Endereço completo</span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/cliente/perfil?returnTo=${encodeURIComponent(`/loja/${slug}/checkout`)}`)}
                  >
                    Completar perfil
                  </Button>
                </div>
              ) : !editingData ? (
                <div className="checkout-profile-data">
                  <div className="checkout-profile-data-row">
                    <span className="checkout-profile-data-icon">👤</span>
                    <div>
                      <p className="checkout-profile-data-label">Nome</p>
                      <p className="checkout-profile-data-value">{savedProfile?.fullName}</p>
                    </div>
                  </div>
                  {savedProfile?.phone && (
                    <div className="checkout-profile-data-row">
                      <span className="checkout-profile-data-icon">📱</span>
                      <div>
                        <p className="checkout-profile-data-label">Telefone / WhatsApp</p>
                        <p className="checkout-profile-data-value">{savedProfile.phone}</p>
                      </div>
                    </div>
                  )}
                  {deliveryMode === 'delivery' && (
                    <div className="checkout-profile-data-row">
                      <span className="checkout-profile-data-icon">📍</span>
                      <div>
                        <p className="checkout-profile-data-label">Endereço de entrega</p>
                        <p className="checkout-profile-data-value">{formattedProfileAddress}</p>
                      </div>
                    </div>
                  )}
                  <div className="checkout-profile-actions">
                    <Button variant="ghost" onClick={() => setEditingData(true)}>
                      Editar dados
                    </Button>
                    <Button variant="ghost" onClick={() => navigate(`/cliente/perfil?returnTo=${encodeURIComponent(`/loja/${slug}/checkout`)}`)}>
                      Ir ao perfil
                    </Button>
                  </div>
                  <Input
                    label="Observação (opcional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={deliveryMode === 'delivery' ? 'Ex: portão azul, ap 42...' : 'Ex: sem cebola...'}
                  />
                </div>
              ) : (
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
                  {deliveryMode === 'delivery' && (
                    <Input
                      label="Endereço de entrega"
                      value={address || formattedProfileAddress}
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
                  <Button variant="ghost" onClick={restoreProfileData}>
                    Usar dados do perfil
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div>
              <p className="error-text">{errorMessage}</p>
            </div>
          )}

          {/* CTA final */}
          <div className="checkout-cta-area">
            <div className="checkout-cta-total">
              <span className="checkout-cta-total-label">Total do pedido</span>
              <span className="checkout-cta-total-value">{formatCurrency(total)}</span>
            </div>

            {!profileComplete ? (
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                onClick={() => navigate(`/cliente/perfil?returnTo=${encodeURIComponent(`/loja/${slug}/checkout`)}`)}
              >
                Completar perfil para continuar
              </Button>
            ) : (
              <Button
                variant="store"
                size="lg"
                storeColor={storeTheme.primaryColor}
                style={{ width: '100%' }}
                onClick={handleConfirm}
                disabled={isOrderBlocked}
              >
                <Icon name="check" className="icon-sm" />
                {submitting ? 'Confirmando…' : 'Confirmar pedido'}
              </Button>
            )}

            <p className="checkout-cta-notice">
              🔒 O pedido será enviado para a loja. O pagamento é confirmado manualmente.
            </p>
          </div>
        </>
      )}

      {/* Sticky bottom bar (mobile only) */}
      {items.length > 0 && (
        <div className="checkout-sticky-bar">
          <div className="checkout-sticky-info">
            <span className="checkout-sticky-label">Total</span>
            <span className="checkout-sticky-total">{formatCurrency(total)}</span>
          </div>
          {!profileComplete ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/cliente/perfil?returnTo=${encodeURIComponent(`/loja/${slug}/checkout`)}`)}
            >
              Completar perfil
            </Button>
          ) : (
            <Button
              variant="store"
              size="md"
              storeColor={storeTheme.primaryColor}
              onClick={handleConfirm}
              disabled={isOrderBlocked}
            >
              {submitting ? 'Confirmando…' : 'Confirmar pedido'}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
