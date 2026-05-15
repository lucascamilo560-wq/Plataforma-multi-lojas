import { Button } from '../../../components/ui/Button'
import type { Order, Store } from '../../../types'
import { formatCurrency } from '../../../utils/currency'

function sanitizePhone(phone?: string) {
  return (phone ?? '').replace(/\D/g, '')
}

function shortOrderId(orderId: string) {
  const value = orderId.split('-').at(-1) ?? orderId
  return value.slice(0, 8).toUpperCase()
}

interface WhatsAppMessage {
  key: string
  label: string
  text: string
}

function buildWhatsAppMessages(order: Order, store: Store | undefined): WhatsAppMessage[] {
  const nome = order.customerName || 'cliente'
  const shortId = shortOrderId(order.id)
  const total = formatCurrency(order.total)
  const storeName = store?.name || 'nossa loja'

  const messages: WhatsAppMessage[] = [
    {
      key: 'confirm',
      label: 'Confirmar recebimento',
      text: `Olá, ${nome}! Recebemos seu pedido #${shortId} na ${storeName}. Vamos iniciar o atendimento.`,
    },
    {
      key: 'payment',
      label: 'Pedir pagamento',
      text: `Olá, ${nome}! Seu pedido #${shortId} ficou em ${total}. Pode nos enviar o comprovante ou combinar o pagamento por aqui?`,
    },
    {
      key: 'preparing',
      label: 'Pedido em preparo',
      text: `Olá, ${nome}! Seu pedido #${shortId} já está sendo preparado.`,
    },
  ]

  if (order.deliveryType === 'pickup') {
    messages.push({
      key: 'ready',
      label: 'Pronto para retirada',
      text: `Olá, ${nome}! Seu pedido #${shortId} está pronto para retirada.`,
    })
  } else if (order.deliveryType === 'arrange') {
    messages.push({
      key: 'ready',
      label: 'Combinar entrega',
      text: `Olá, ${nome}! Vamos combinar a entrega do seu pedido #${shortId}?`,
    })
  } else {
    messages.push({
      key: 'ready',
      label: 'Pronto / em rota',
      text: `Olá, ${nome}! Seu pedido #${shortId} está em rota ou será entregue em breve.`,
    })
  }

  messages.push({
    key: 'delivered',
    label: 'Pedido entregue',
    text: `Olá, ${nome}! Seu pedido #${shortId} foi marcado como entregue. Obrigado pela preferência!`,
  })

  return messages
}

interface Props {
  order: Order
  store: Store | undefined
}

export function WhatsAppQuickMessages({ order, store }: Props) {
  const phone = sanitizePhone(order.customerPhone)
  const messages = buildWhatsAppMessages(order, store)

  const openWhatsApp = (text: string) => {
    if (!phone) return
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      <small style={{ fontWeight: 600 }}>📲 Mensagens prontas para WhatsApp</small>
      {!phone && (
        <small className="muted">Telefone do cliente não informado.</small>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {messages.map((msg) => (
          <Button
            key={msg.key}
            type="button"
            variant="ghost"
            disabled={!phone}
            onClick={() => openWhatsApp(msg.text)}
          >
            {msg.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
