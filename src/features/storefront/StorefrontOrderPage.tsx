import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getOrderById, getStoreBySlug } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, OrderStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação',
  paid: 'Pagamento confirmado',
  preparing: 'Em preparação',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

function getStatusVariant(status: OrderStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'cancelled') return 'danger'
  if (status === 'delivered') return 'success'
  if (status === 'pending') return 'accent'
  return 'muted'
}

export function StorefrontOrderPage() {
  const { slug = '', orderId = '' } = useParams()
  const [store, setStore] = useState<Store | undefined>()
  const [order, setOrder] = useState<Order | undefined>()

  useEffect(() => {
    getStoreBySlug(slug).then(setStore)
    getOrderById(orderId).then(setOrder)
  }, [slug, orderId])

  if (!order || !store) {
    return (
      <section className="stack-lg">
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
  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Olá! Quero acompanhar meu pedido #${order.id} feito na ${store.name}.`)}`
    : null

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Pedido confirmado"
        icon="check"
        title="A loja recebeu seu pedido!"
        description={`Acompanhe o status abaixo. A ${store.name} cuidará do seu pedido com atenção.`}
      />

      <div className="grid">
        <Card
          title={`Pedido #${order.id}`}
          subtitle={`Criado em ${new Date(order.createdAt).toLocaleString('pt-BR')}`}
          variant="accentCorner"
        >
          <div className="inline-info">
            <Badge variant={getStatusVariant(order.status)}>{statusLabel[order.status]}</Badge>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
          {order.paymentMethod && (
            <p className="muted">Pagamento: {order.paymentMethod}</p>
          )}
          {order.deliveryType && (
            <p className="muted">
              {order.deliveryType === 'delivery' ? 'Entrega em domicílio' : 'Retirada na loja'}
              {order.address ? ` — ${order.address}` : ''}
            </p>
          )}
          {order.notes && <p className="muted">Obs: {order.notes}</p>}
        </Card>

        {order.items && order.items.length > 0 && (
          <Card title="Itens do pedido" subtitle="Resumo do que foi pedido" variant="layered">
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
                <strong>Total</strong>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
          </Card>
        )}

        <Card title="Próximos passos" subtitle="O que acontece agora?" variant="layered">
          <div className="stack" style={{ gap: '0.5rem' }}>
            <p className="muted">
              A loja recebeu seu pedido e em breve confirmará. Você pode acompanhar o andamento
              diretamente pelo WhatsApp se preferir.
            </p>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="store" storeColor={storeTheme.primaryColor}>
                  Falar com a loja pelo WhatsApp
                </Button>
              </a>
            )}
            <Link to={`/loja/${slug}`}>
              <Button variant="secondary">Continuar comprando</Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}
