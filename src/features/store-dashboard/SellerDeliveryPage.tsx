import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getDeliverySettings, updateDeliverySettings } from '../../services/mockData'

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

  const handleCheckboxChange = (field: keyof DeliveryFormState) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormState((current) => ({ ...current, [field]: event.target.checked }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    const { value: parsedMinutes, error: minutesError } = parsePositiveNumber(formState.estimatedMinutes, 'tempo estimado')
    const { value: parsedFee, error: feeError } = parsePositiveNumber(formState.fee, 'taxa de entrega')
    const { value: parsedMinOrder, error: minOrderError } = parsePositiveNumber(formState.minOrder, 'pedido mínimo')

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
        description="Configure retirada, entrega, bairros atendidos e taxas. Essas opções aparecem no checkout."
      />

      <Card title="Opções de entrega e retirada" subtitle="Ative e configure cada modalidade" variant="layered">
        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack" style={{ gap: '0.75rem' }}>
            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formState.pickupEnabled}
                onChange={handleCheckboxChange('pickupEnabled')}
                style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
              />
              <span>Retirada no local</span>
            </label>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formState.deliveryEnabled}
                onChange={handleCheckboxChange('deliveryEnabled')}
                style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
              />
              <span>Entrega própria</span>
            </label>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formState.combineDelivery}
                onChange={handleCheckboxChange('combineDelivery')}
                style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
              />
              <span>Combinar entrega (cliente combina com a loja)</span>
            </label>
          </div>

          {formState.pickupEnabled && (
            <Input
              id="delivery-pickup-address"
              label="Endereço para retirada"
              value={formState.pickupAddress}
              onChange={handleTextChange('pickupAddress')}
              placeholder="Ex: Rua das Flores, 100 — Centro"
            />
          )}

          {formState.deliveryEnabled && (
            <div className="grid grid-3">
              <Input
                id="delivery-estimated"
                label="Tempo estimado (minutos)"
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
          )}

          {formState.deliveryEnabled && (
            <Input
              id="delivery-neighborhoods"
              label="Bairros atendidos (opcional)"
              value={formState.neighborhoods}
              onChange={handleTextChange('neighborhoods')}
              placeholder="Ex: Centro, Vila Nova, Jardim América"
            />
          )}

          <label className="field" htmlFor="delivery-notes">
            <span className="field-label">Observações de entrega (opcional)</span>
            <textarea
              id="delivery-notes"
              className="input"
              value={formState.deliveryNotes}
              onChange={handleTextChange('deliveryNotes')}
              rows={3}
              placeholder="Ex: Entregamos das 9h às 18h, apenas em dias úteis."
            />
          </label>

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
      </Card>
    </section>
  )
}
