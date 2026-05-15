import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getDeliverySettings, updateDeliverySettings } from '../../services/mockData'
import { formatCurrency } from '../../utils/currency'

interface DeliveryFormState {
  pickupEnabled: boolean
  deliveryEnabled: boolean
  combineDelivery: boolean
  estimatedMinutes: string
  fee: string
  minOrder: string
  neighborhoods: string
  pickupAddress: string
  deliveryNotes: string
}

const DEFAULT_STATE: DeliveryFormState = {
  pickupEnabled: false,
  deliveryEnabled: false,
  combineDelivery: false,
  estimatedMinutes: '0',
  fee: '0',
  minOrder: '0',
  neighborhoods: '',
  pickupAddress: '',
  deliveryNotes: '',
}

function parsePositiveNumber(value: string, fieldName: string): { value: number; error?: string } {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { value: 0, error: `Informe um valor válido (0 ou maior) para: ${fieldName}.` }
  }
  return { value: parsed }
}

function ModalityCard({
  icon,
  title,
  description,
  active,
  onToggle,
  children,
  badgeLabel,
  badgeColor,
}: {
  icon: string
  title: string
  description: string
  active: boolean
  onToggle: () => void
  children?: React.ReactNode
  badgeLabel: string
  badgeColor: string
}) {
  return (
    <div
      style={{
        border: active
          ? '2px solid var(--color-accent, #3A86FF)'
          : '1.5px solid var(--color-border)',
        borderRadius: '0.85rem',
        padding: '1rem 1.1rem',
        background: active
          ? 'var(--color-accent-subtle, #f0f7ff)'
          : 'var(--color-surface, #fff)',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: active && children ? '0.85rem' : 0,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                background: active ? badgeColor : 'var(--color-border)',
                color: active ? '#fff' : 'var(--color-muted)',
              }}
            >
              {active ? badgeLabel : 'Inativo'}
            </span>
          </div>
          <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.85rem' }}>
            {description}
          </p>
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: active ? 'var(--color-accent, #3A86FF)' : 'var(--color-muted)',
          }}
        >
          <input
            type="checkbox"
            checked={active}
            onChange={onToggle}
            style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
          />
          Ativar
        </label>
      </div>
      {active && children && <div className="stack" style={{ gap: '0.65rem' }}>{children}</div>}
    </div>
  )
}

function NeighborhoodChips({ value }: { value: string }) {
  const chips = useMemo(
    () =>
      value
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
    [value],
  )

  if (chips.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem' }}>
      {chips.map((chip) => (
        <span
          key={chip}
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: 'var(--color-accent-subtle, #f0f7ff)',
            color: 'var(--color-accent, #3A86FF)',
            border: '1px solid var(--color-accent, #3A86FF)',
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

function CheckoutPreview({ form }: { form: DeliveryFormState }) {
  const fee = Number(form.fee) || 0
  const minOrder = Number(form.minOrder) || 0
  const minutes = Number(form.estimatedMinutes) || 0

  const hasAny = form.pickupEnabled || form.deliveryEnabled || form.combineDelivery
  if (!hasAny) {
    return (
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        Ative pelo menos uma modalidade para ver a prévia.
      </p>
    )
  }

  return (
    <div className="stack" style={{ gap: '0.6rem' }}>
      {form.pickupEnabled && (
        <div
          style={{
            borderRadius: '0.65rem',
            border: '1.5px solid var(--color-border)',
            padding: '0.7rem 0.9rem',
            background: 'var(--color-surface, #fff)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>🏪 Retirada no local</div>
          {form.pickupAddress.trim() ? (
            <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
              📍 {form.pickupAddress.trim()}
            </p>
          ) : (
            <p className="muted" style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-warning, #f59e0b)' }}>
              ⚠️ Endereço de retirada não informado
            </p>
          )}
        </div>
      )}

      {form.deliveryEnabled && (
        <div
          style={{
            borderRadius: '0.65rem',
            border: '1.5px solid var(--color-border)',
            padding: '0.7rem 0.9rem',
            background: 'var(--color-surface, #fff)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            🛵 Entrega própria {fee > 0 ? `— +${formatCurrency(fee)}` : '— Grátis'}
          </div>
          {minutes > 0 && (
            <p className="muted" style={{ margin: '0 0 0.1rem', fontSize: '0.82rem' }}>
              ⏱ Tempo estimado: ~{minutes} min
            </p>
          )}
          {form.neighborhoods.trim() && (
            <p className="muted" style={{ margin: '0 0 0.25rem', fontSize: '0.82rem' }}>
              🗺 Bairros: {form.neighborhoods.trim()}
            </p>
          )}
          {minOrder > 0 && (
            <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
              📦 Pedido mínimo: {formatCurrency(minOrder)}
            </p>
          )}
        </div>
      )}

      {form.combineDelivery && (
        <div
          style={{
            borderRadius: '0.65rem',
            border: '1.5px solid var(--color-border)',
            padding: '0.7rem 0.9rem',
            background: 'var(--color-surface, #fff)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>💬 Combinar entrega</div>
          <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
            Você combinará entrega com a loja após confirmar o pedido.
          </p>
        </div>
      )}

      {form.deliveryNotes.trim() && (
        <p className="muted" style={{ fontSize: '0.82rem', fontStyle: 'italic' }}>
          📝 {form.deliveryNotes.trim()}
        </p>
      )}
    </div>
  )
}

export function SellerDeliveryPage() {
  const { storeId } = useMockSession()
  const [formState, setFormState] = useState<DeliveryFormState>(DEFAULT_STATE)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadSettings = useCallback(() => {
    getDeliverySettings(storeId).then((settings) => {
      if (!settings) return
      setFormState({
        pickupEnabled: settings.pickupEnabled,
        deliveryEnabled: settings.deliveryEnabled,
        combineDelivery: settings.combineDelivery ?? false,
        estimatedMinutes: String(settings.estimatedMinutes),
        fee: String(settings.fee),
        minOrder: String(settings.minOrder ?? 0),
        neighborhoods: settings.neighborhoods ?? '',
        pickupAddress: settings.pickupAddress ?? '',
        deliveryNotes: settings.deliveryNotes ?? '',
      })
    })
  }, [storeId])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleTextChange = (field: keyof DeliveryFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const toggleField = (field: 'pickupEnabled' | 'deliveryEnabled' | 'combineDelivery') => {
    setFormState((current) => ({ ...current, [field]: !current[field] }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const noneActive =
    !formState.pickupEnabled && !formState.deliveryEnabled && !formState.combineDelivery

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    const { value: parsedMinutes, error: minutesError } = parsePositiveNumber(
      formState.estimatedMinutes,
      'tempo estimado',
    )
    const { value: parsedFee, error: feeError } = parsePositiveNumber(
      formState.fee,
      'taxa de entrega',
    )
    const { value: parsedMinOrder, error: minOrderError } = parsePositiveNumber(
      formState.minOrder,
      'pedido mínimo',
    )

    const validationError = minutesError ?? feeError ?? minOrderError
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    await updateDeliverySettings(storeId, {
      pickupEnabled: formState.pickupEnabled,
      deliveryEnabled: formState.deliveryEnabled,
      combineDelivery: formState.combineDelivery,
      estimatedMinutes: parsedMinutes,
      fee: parsedFee,
      minOrder: parsedMinOrder,
      neighborhoods: formState.neighborhoods.trim(),
      pickupAddress: formState.pickupAddress.trim(),
      deliveryNotes: formState.deliveryNotes.trim(),
    })

    setSuccessMessage('Configurações de entrega salvas com sucesso.')
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Entrega e retirada"
        icon="clock"
        title="Defina sua logística"
        description="Configure retirada, entrega e bairros. Essas opções aparecem no checkout do cliente."
      />

      <form className="stack-lg" onSubmit={handleSubmit}>
        <Card
          title="Modalidades de entrega"
          subtitle="Ative e configure cada opção disponível para seus clientes"
          variant="layered"
        >
          <div className="stack" style={{ gap: '0.85rem' }}>
            {noneActive && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  background: 'var(--color-warning-subtle, #fef9c3)',
                  border: '1.5px solid var(--color-warning, #f59e0b)',
                  color: 'var(--color-warning-dark, #92400e)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                }}
              >
                ⚠️ Ative retirada, entrega própria ou combinar entrega para receber pedidos.
              </div>
            )}

            <ModalityCard
              icon="🏪"
              title="Retirada no local"
              description="O cliente retira o pedido diretamente na sua loja ou ponto de retirada."
              active={formState.pickupEnabled}
              onToggle={() => toggleField('pickupEnabled')}
              badgeLabel="Ativo"
              badgeColor="var(--color-success, #16a34a)"
            >
              <Input
                id="delivery-pickup-address"
                label="Endereço de retirada"
                value={formState.pickupAddress}
                onChange={handleTextChange('pickupAddress')}
                placeholder="Ex: Rua das Flores, 100 — Centro"
              />
              {!formState.pickupAddress.trim() && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: 'var(--color-warning-dark, #92400e)',
                    background: 'var(--color-warning-subtle, #fef9c3)',
                    padding: '0.4rem 0.7rem',
                    borderRadius: '0.4rem',
                  }}
                >
                  ⚠️ Recomendamos informar o endereço de retirada para facilitar para o cliente.
                </p>
              )}
            </ModalityCard>

            <ModalityCard
              icon="🛵"
              title="Entrega própria"
              description="Você mesmo faz a entrega. Configure taxa, tempo estimado e bairros atendidos."
              active={formState.deliveryEnabled}
              onToggle={() => toggleField('deliveryEnabled')}
              badgeLabel="Ativo"
              badgeColor="var(--color-accent, #3A86FF)"
            >
              <div className="grid grid-3">
                <Input
                  id="delivery-estimated"
                  label="Tempo estimado (min)"
                  type="number"
                  min={0}
                  value={formState.estimatedMinutes}
                  onChange={handleTextChange('estimatedMinutes')}
                />
                <Input
                  id="delivery-fee"
                  label="Taxa de entrega (R$)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formState.fee}
                  onChange={handleTextChange('fee')}
                />
                <Input
                  id="delivery-min-order"
                  label="Pedido mínimo (R$)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formState.minOrder}
                  onChange={handleTextChange('minOrder')}
                />
              </div>

              <div>
                <Input
                  id="delivery-neighborhoods"
                  label="Bairros atendidos (separados por vírgula)"
                  value={formState.neighborhoods}
                  onChange={handleTextChange('neighborhoods')}
                  placeholder="Ex: Centro, Vila Nova, Jardim América"
                />
                <NeighborhoodChips value={formState.neighborhoods} />
              </div>
            </ModalityCard>

            <ModalityCard
              icon="💬"
              title="Combinar entrega com cliente"
              description="O cliente finaliza o pedido e combina a entrega com você pelo WhatsApp ou telefone."
              active={formState.combineDelivery}
              onToggle={() => toggleField('combineDelivery')}
              badgeLabel="Ativo"
              badgeColor="#8B5CF6"
            >
              <div
                style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: '0.5rem',
                  background: 'var(--color-surface-raised, #f9fafb)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  color: 'var(--color-muted)',
                }}
              >
                💡 O cliente poderá finalizar o pedido e combinar a entrega com você pelo WhatsApp ou telefone.
              </div>
            </ModalityCard>
          </div>
        </Card>

        <Card
          title="Observações de entrega"
          subtitle="Informações adicionais exibidas no checkout (opcional)"
          variant="layered"
        >
          <label className="field" htmlFor="delivery-notes">
            <span className="field-label">Observações (opcional)</span>
            <textarea
              id="delivery-notes"
              className="input"
              value={formState.deliveryNotes}
              onChange={handleTextChange('deliveryNotes')}
              rows={3}
              placeholder="Ex: Entregamos das 9h às 18h, apenas em dias úteis."
            />
          </label>
        </Card>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {successMessage && (
          <p className="muted" style={{ color: 'var(--color-success, green)' }}>
            {successMessage}
          </p>
        )}

        <div className="inline-info">
          <Button type="submit" variant="accent">
            Salvar configurações de entrega
          </Button>
        </div>
      </form>

      <Card
        title="Como aparecerá no checkout"
        subtitle="Prévia do que o cliente verá ao finalizar o pedido"
        variant="layered"
      >
        <CheckoutPreview form={formState} />
      </Card>
    </section>
  )
}
