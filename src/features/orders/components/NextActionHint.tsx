import type { Order } from '../../../types'

interface NextAction {
  label: string
}

function getNextOrderActions(order: Order): NextAction[] {
  if (order.status === 'delivered' || order.status === 'cancelled') {
    return []
  }

  const actions: NextAction[] = []

  if (order.status === 'pending') {
    actions.push({ label: 'Confirmar pedido ou cancelar.' })
  } else if (order.status === 'paid') {
    actions.push({ label: 'Marcar como preparando.' })
  } else if (order.status === 'preparing') {
    actions.push({ label: 'Marcar como entregue.' })
  }

  if (order.paymentStatus === 'awaiting_payment') {
    actions.push({ label: 'Confirmar pagamento quando receber.' })
  }

  if (order.paymentStatus === 'to_be_arranged') {
    actions.push({ label: 'Chamar cliente para combinar pagamento.' })
  }

  if (order.deliveryType === 'arrange') {
    actions.push({ label: 'Chamar cliente para combinar entrega.' })
  }

  if (order.orderPlacedWhileClosed) {
    actions.push({ label: 'Atender no próximo horário de funcionamento.' })
  }

  return actions
}

interface Props {
  order: Order
}

export function NextActionHint({ order }: Props) {
  const actions = getNextOrderActions(order)

  if (!actions.length) return null

  return (
    <div
      style={{
        padding: '0.6rem 0.75rem',
        background: 'var(--color-surface-raised, #f9fafb)',
        borderRadius: '0.5rem',
        border: '1px solid var(--color-border)',
      }}
    >
      <small style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
        💡 Próxima ação
      </small>
      <div className="stack" style={{ gap: '0.2rem' }}>
        {actions.map((action) => (
          <small key={action.label} className="muted">
            • {action.label}
          </small>
        ))}
      </div>
    </div>
  )
}
