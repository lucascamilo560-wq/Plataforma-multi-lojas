import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getPaymentSettings, updatePaymentSettings } from '../../services/mockData'
import type { OrderPaymentMethod } from '../../types'

interface PaymentOption {
  name: string
  type: OrderPaymentMethod
  enabled: boolean
  pixKey?: string
  instructions?: string
  externalUrl?: string
}

const DEFAULT_METHODS: PaymentOption[] = [
  { name: 'Pix', type: 'pix', enabled: false },
  { name: 'Dinheiro', type: 'cash', enabled: false },
  { name: 'Cartão na entrega', type: 'card_on_delivery', enabled: false },
  { name: 'Pagamento na retirada', type: 'pickup_payment', enabled: false },
  { name: 'Link de pagamento externo', type: 'external_payment_link', enabled: false },
  { name: 'Combinar pelo WhatsApp', type: 'whatsapp', enabled: false },
]

export function SellerPaymentsPage() {
  const { storeId } = useMockSession()
  const [methods, setMethods] = useState<PaymentOption[]>(DEFAULT_METHODS)
  const [successMessage, setSuccessMessage] = useState('')

  const loadPayments = useCallback(() => {
    getPaymentSettings(storeId).then((saved) => {
      if (saved.length === 0) {
        setMethods(DEFAULT_METHODS.map((m) => ({ ...m })))
        return
      }
      setMethods(
        DEFAULT_METHODS.map((defaultMethod) => {
          const found = saved.find((s) => s.name === defaultMethod.name)
          if (!found) return { ...defaultMethod }
          return {
            name: found.name,
            type: found.type ?? defaultMethod.type,
            enabled: found.enabled,
            pixKey: found.pixKey ?? '',
            instructions: found.instructions ?? '',
            externalUrl: found.externalUrl ?? '',
          }
        }),
      )
    })
  }, [storeId])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const handleToggle = (index: number) => {
    setMethods((current) =>
      current.map((method, i) => (i === index ? { ...method, enabled: !method.enabled } : method)),
    )
    setSuccessMessage('')
  }

  const handleFieldChange = (index: number, field: keyof PaymentOption, value: string) => {
    setMethods((current) =>
      current.map((method, i) => (i === index ? { ...method, [field]: value } : method)),
    )
    setSuccessMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    for (const method of methods) {
      if (method.enabled && method.type === 'external_payment_link' && !method.externalUrl?.trim()) {
        setSuccessMessage('')
        alert('O método "Link de pagamento externo" requer uma URL de pagamento.')
        return
      }
    }

    await updatePaymentSettings(storeId, methods)
    setSuccessMessage('Formas de pagamento salvas com sucesso.')
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Pagamentos"
        icon="wallet"
        title="Configure formas de pagamento"
        description="Defina como sua loja recebe pedidos. Essas opções aparecem no checkout para o cliente."
      />

      <Card title="Formas de pagamento aceitas" subtitle="Ative as opções e configure os dados de cada método" variant="layered">
        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack" style={{ gap: '1.25rem' }}>
            {methods.map((method, index) => (
              <div
                key={method.name}
                style={{
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  background: method.enabled ? 'var(--color-surface-raised, #f9fafb)' : 'transparent',
                }}
              >
                <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={() => handleToggle(index)}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 600 }}>{method.name}</span>
                </label>

                {method.enabled && (
                  <div className="stack" style={{ gap: '0.75rem', marginTop: '0.75rem', paddingLeft: '1.85rem' }}>
                    {method.type === 'pix' && (
                      <>
                        <Input
                          label="Chave Pix"
                          value={method.pixKey ?? ''}
                          onChange={(e) => handleFieldChange(index, 'pixKey', e.target.value)}
                          placeholder="Ex: email@exemplo.com ou 11999990000"
                        />
                        {!method.pixKey?.trim() && (
                          <p style={{ color: 'var(--color-warning, #d97706)', fontSize: '0.85rem', margin: 0 }}>
                            ⚠️ Informe a chave Pix para que os clientes possam efetuar o pagamento.
                          </p>
                        )}
                        <Input
                          label="Instruções (opcional)"
                          value={method.instructions ?? ''}
                          onChange={(e) => handleFieldChange(index, 'instructions', e.target.value)}
                          placeholder="Ex: Pague e envie o comprovante pelo WhatsApp."
                        />
                      </>
                    )}

                    {method.type === 'external_payment_link' && (
                      <>
                        <Input
                          label="URL do link de pagamento *"
                          value={method.externalUrl ?? ''}
                          onChange={(e) => handleFieldChange(index, 'externalUrl', e.target.value)}
                          placeholder="https://pague.exemplo.com/sua-loja"
                        />
                        {!method.externalUrl?.trim() && (
                          <p style={{ color: 'var(--color-error, #dc2626)', fontSize: '0.85rem', margin: 0 }}>
                            ❌ URL obrigatória. Sem ela o cliente não conseguirá acessar o link de pagamento.
                          </p>
                        )}
                        <Input
                          label="Instruções (opcional)"
                          value={method.instructions ?? ''}
                          onChange={(e) => handleFieldChange(index, 'instructions', e.target.value)}
                          placeholder="Ex: Você será redirecionado para nossa página de pagamento seguro."
                        />
                      </>
                    )}

                    {method.type === 'whatsapp' && (
                      <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                        💬 O cliente poderá chamar a loja via WhatsApp após confirmar o pedido. Certifique-se de que o número de WhatsApp está cadastrado em <strong>Minha Loja</strong>.
                      </p>
                    )}

                    {(method.type === 'cash' || method.type === 'card_on_delivery' || method.type === 'pickup_payment') && (
                      <Input
                        label="Instruções para o cliente (opcional)"
                        value={method.instructions ?? ''}
                        onChange={(e) => handleFieldChange(index, 'instructions', e.target.value)}
                        placeholder="Ex: Tenha o troco, aceitamos débito e crédito."
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {successMessage && (
            <p className="muted" style={{ color: 'var(--color-success, green)' }}>
              {successMessage}
            </p>
          )}

          <div className="inline-info">
            <Button type="submit" variant="accent">
              Salvar pagamentos
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
