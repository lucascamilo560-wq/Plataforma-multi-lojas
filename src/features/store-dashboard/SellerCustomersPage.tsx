import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import {
  getCustomerOrdersByKey,
  getStoreById,
  getStoreCustomers,
} from '../../services/mockData'
import type { CustomerSummary } from '../../services/mockData'
import type { Order, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { buildPublicUrl } from '../../utils/publicUrl'

type CustomerFilter = 'all' | 'new' | 'recurring' | 'payment_pending' | 'inactive' | 'top_spenders'
type CustomerSort = 'last_order' | 'total_spent' | 'total_orders'

const paymentStatusLabel: Record<Order['paymentStatus'], string> = {
  awaiting_payment: 'Aguardando pagamento',
  to_be_arranged: 'Pagamento a combinar',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Estornado',
}

const orderStatusLabel: Record<Order['status'], string> = {
  pending: 'Novo / pendente',
  paid: 'Confirmado',
  preparing: 'Preparando',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const INACTIVE_DAYS = 30
const VIP_SPENT_THRESHOLD = 300
const VIP_ORDERS_THRESHOLD = 5

function isNew(c: CustomerSummary) {
  return c.totalOrders === 1
}

function isRecurring(c: CustomerSummary) {
  return c.totalOrders >= 2
}

function isVip(c: CustomerSummary) {
  return c.totalSpent >= VIP_SPENT_THRESHOLD || c.totalOrders >= VIP_ORDERS_THRESHOLD
}

function isInactive(c: CustomerSummary) {
  const diff = (Date.now() - new Date(c.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24)
  return diff > INACTIVE_DAYS
}

function hasPaymentPending(c: CustomerSummary) {
  return c.paymentPendingCount > 0
}

function formatRelativeDate(isoDate: string) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `há ${diff} dias`
}

function sanitizePhone(phone?: string) {
  return (phone ?? '').replace(/\D/g, '')
}

export function SellerCustomersPage() {
  const { storeId } = useMockSession()
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<CustomerFilter>('all')
  const [selectedSort, setSelectedSort] = useState<CustomerSort>('last_order')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Record<string, Order[]>>({})

  const refresh = useCallback(() => {
    getStoreCustomers(storeId).then(setCustomers)
    getStoreById(storeId).then(setStore)
  }, [storeId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return customers.filter((c) => {
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'new' && isNew(c)) ||
        (selectedFilter === 'recurring' && isRecurring(c)) ||
        (selectedFilter === 'payment_pending' && hasPaymentPending(c)) ||
        (selectedFilter === 'inactive' && isInactive(c)) ||
        (selectedFilter === 'top_spenders' && c.totalSpent >= VIP_SPENT_THRESHOLD)

      if (!matchesFilter) return false
      if (!term) return true

      return (
        c.name.toLowerCase().includes(term) ||
        (c.phone ?? '').toLowerCase().includes(term)
      )
    })
  }, [customers, searchTerm, selectedFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (selectedSort === 'last_order') {
        return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
      }
      if (selectedSort === 'total_spent') {
        return b.totalSpent - a.totalSpent
      }
      return b.totalOrders - a.totalOrders
    })
  }, [filtered, selectedSort])

  const handleToggleHistory = async (key: string) => {
    if (expandedKey === key) {
      setExpandedKey(null)
      return
    }

    setExpandedKey(key)

    if (!customerOrders[key]) {
      const orders = await getCustomerOrdersByKey(storeId, key)
      setCustomerOrders((prev) => ({ ...prev, [key]: orders }))
    }
  }

  const openWhatsApp = (customer: CustomerSummary, message: string) => {
    const phone = sanitizePhone(customer.phone)
    if (!phone) return
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleSendReturn = (customer: CustomerSummary) => {
    const storeName = store?.name ?? 'nossa loja'
    const link = store?.slug ? buildPublicUrl(`/loja/${store.slug}`) : ''
    const msg = link
      ? `Olá, ${customer.name}! Aqui é da loja ${storeName}. Temos novidades e ofertas para você. Quer dar uma olhada na nossa vitrine? ${link}`
      : `Olá, ${customer.name}! Aqui é da loja ${storeName}. Temos novidades e ofertas para você. Quer dar uma olhada na nossa vitrine?`
    openWhatsApp(customer, msg)
  }

  const handleSendCoupon = (customer: CustomerSummary) => {
    const storeName = store?.name ?? 'nossa loja'
    const link = store?.slug ? buildPublicUrl(`/loja/${store.slug}`) : ''
    const msg = `Olá, ${customer.name}! Temos um cupom especial para você usar na loja ${storeName}. Acesse nossa vitrine: ${link}`
    openWhatsApp(customer, msg)
  }

  const handleCopyPhone = async (phone: string) => {
    try {
      await window.navigator.clipboard.writeText(phone)
    } catch {
      // silently fail
    }
  }

  const filters: Array<{ key: CustomerFilter; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'new', label: 'Novos' },
    { key: 'recurring', label: 'Recorrentes' },
    { key: 'payment_pending', label: 'Pagamento pendente' },
    { key: 'inactive', label: 'Inativos' },
    { key: 'top_spenders', label: 'Maior gasto' },
  ]

  const sortOptions: Array<{ key: CustomerSort; label: string }> = [
    { key: 'last_order', label: 'Última compra' },
    { key: 'total_spent', label: 'Total gasto' },
    { key: 'total_orders', label: 'Qtd. pedidos' },
  ]

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Clientes"
        icon="user"
        title={`Clientes de ${store?.name ?? 'sua loja'}`}
        description="Central de relacionamento com seus clientes — histórico, fidelização e atendimento rápido."
      />

      <Card variant="layered" title="Filtros e busca" subtitle="Segmente e encontre seus clientes.">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <Input
            label="Buscar cliente"
            placeholder="Nome ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {filters.map((f) => (
              <Button
                key={f.key}
                type="button"
                variant={selectedFilter === f.key ? 'primary' : 'ghost'}
                onClick={() => setSelectedFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <small className="muted">Ordenar por:</small>
            {sortOptions.map((s) => (
              <Button
                key={s.key}
                type="button"
                variant={selectedSort === s.key ? 'secondary' : 'ghost'}
                onClick={() => setSelectedSort(s.key)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {sorted.length === 0 && (
        <Card variant="layered" title="Nenhum cliente encontrado" subtitle="Ainda não há pedidos registrados nesta loja ou sua busca não retornou resultados." />
      )}

      <div className="grid">
        {sorted.map((customer) => {
          const isExpanded = expandedKey === customer.key
          const orders = customerOrders[customer.key] ?? []

          return (
            <Card
              key={customer.key}
              variant="layered"
              title={customer.name}
              subtitle={customer.phone ?? 'Sem telefone cadastrado'}
            >
              {/* Badges */}
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {isVip(customer) && <Badge variant="accent">⭐ VIP</Badge>}
                {isRecurring(customer) && !isVip(customer) && <Badge variant="success">Recorrente</Badge>}
                {isNew(customer) && <Badge variant="muted">Novo</Badge>}
                {hasPaymentPending(customer) && <Badge variant="danger">Pagamento pendente</Badge>}
                {isInactive(customer) && <Badge variant="muted">Inativo</Badge>}
              </div>

              {/* Metrics */}
              <div className="grid grid-metrics" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                <div className="stack" style={{ gap: '0.1rem' }}>
                  <small className="muted">Total gasto</small>
                  <strong>{formatCurrency(customer.totalSpent)}</strong>
                </div>
                <div className="stack" style={{ gap: '0.1rem' }}>
                  <small className="muted">Pedidos</small>
                  <strong>{customer.totalOrders}</strong>
                </div>
                <div className="stack" style={{ gap: '0.1rem' }}>
                  <small className="muted">Ticket médio</small>
                  <strong>{formatCurrency(customer.averageTicket)}</strong>
                </div>
                <div className="stack" style={{ gap: '0.1rem' }}>
                  <small className="muted">Última compra</small>
                  <strong>{formatRelativeDate(customer.lastOrderAt)}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Button type="button" variant="ghost" onClick={() => handleToggleHistory(customer.key)}>
                  {isExpanded ? 'Fechar histórico' : 'Ver histórico'}
                </Button>
                {customer.phone && (
                  <>
                    <Button type="button" variant="primary" onClick={() => handleSendReturn(customer)}>
                      Chamar no WhatsApp
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleSendCoupon(customer)}>
                      Enviar cupom
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleCopyPhone(customer.phone!)}>
                      Copiar telefone
                    </Button>
                  </>
                )}
              </div>

              {/* Expanded order history */}
              {isExpanded && (
                <div className="stack" style={{ marginTop: '1rem', gap: '0.75rem' }}>
                  <small className="muted" style={{ fontWeight: 600 }}>
                    Histórico de pedidos ({orders.length})
                  </small>

                  {orders.length === 0 && (
                    <small className="muted">Nenhum pedido encontrado.</small>
                  )}

                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="stack"
                      style={{
                        gap: '0.35rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'var(--color-surface-2, #f9fafb)',
                        border: '1px solid var(--color-border, #e5e7eb)',
                      }}
                    >
                      <div className="inline-info" style={{ justifyContent: 'space-between' }}>
                        <small style={{ fontWeight: 600 }}>
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </small>
                        <strong>{formatCurrency(order.total)}</strong>
                      </div>

                      <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'muted'}>
                          {orderStatusLabel[order.status]}
                        </Badge>
                        <Badge variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'danger' : 'accent'}>
                          {paymentStatusLabel[order.paymentStatus]}
                        </Badge>
                        {order.couponCode && <Badge variant="accent">Cupom: {order.couponCode}</Badge>}
                      </div>

                      {(order.items ?? []).length > 0 && (
                        <div className="stack" style={{ gap: '0.15rem' }}>
                          {(order.items ?? []).map((item) => (
                            <small key={item.product_id} className="muted">
                              {item.productName} × {item.quantity}
                            </small>
                          ))}
                        </div>
                      )}

                      {customer.phone && (
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              const phone = sanitizePhone(customer.phone)
                              const msg = `Olá, ${customer.name}! Referente ao seu pedido de ${new Date(order.createdAt).toLocaleDateString('pt-BR')} — ${formatCurrency(order.total)}. Posso ajudar com algo?`
                              const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                              window.open(link, '_blank', 'noopener,noreferrer')
                            }}
                          >
                            Chamar cliente sobre este pedido
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}

