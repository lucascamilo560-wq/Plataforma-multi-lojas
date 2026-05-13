import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getPaymentSettings, updatePaymentSettings } from '../../services/mockData'

interface PaymentOption {
  name: string
  enabled: boolean
}

const DEFAULT_METHODS: PaymentOption[] = [
  { name: 'Pix', enabled: false },
  { name: 'Dinheiro', enabled: false },
  { name: 'Cartão na entrega', enabled: false },
  { name: 'Pagamento na retirada', enabled: false },
  { name: 'Link de pagamento externo', enabled: false },
  { name: 'Combinar pelo WhatsApp', enabled: false },
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
          return found ? { name: found.name, enabled: found.enabled } : { ...defaultMethod }
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

      <Card title="Formas de pagamento aceitas" subtitle="Ative as opções disponíveis para sua loja" variant="layered">
        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack" style={{ gap: '0.75rem' }}>
            {methods.map((method, index) => (
              <label
                key={method.name}
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => handleToggle(index)}
                  style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                />
                <span>{method.name}</span>
              </label>
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
