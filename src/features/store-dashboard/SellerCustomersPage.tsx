import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import {
  getCustomerOrdersByKey,
  getCustomerRelationshipsByStore,
  getStoreById,
  getStoreCustomers,
  updateCustomerRelationship,
} from '../../services/mockData'
import type { CustomerRelationship, CustomerSummary } from '../../services/mockData'
import type { Order, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { buildPublicUrl } from '../../utils/publicUrl'

type CustomerFilter =
  | 'all'
  | 'new'
  | 'recurring'
  | 'payment_pending'
  | 'inactive'
  | 'top_spenders'
  | 'with_notes'
  | 'with_followup'
  | 'followup_overdue'
  | 'with_tags'

type CustomerSort = 'last_order' | 'total_spent' | 'total_orders' | 'next_followup' | 'last_contacted'

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

const PREDEFINED_TAGS = [
  'VIP',
  'Frequente',
  'Inativo',
  'Pagamento pendente',
  'Prefere entrega',
  'Prefere retirada',
  'Promoções',
  'Atendimento especial',
]

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

function isFollowUpOverdue(rel?: CustomerRelationship) {
  if (!rel?.nextFollowUpAt) return false
  return new Date(rel.nextFollowUpAt).setHours(23, 59, 59, 999) < Date.now()
}

function formatRelativeDate(isoDate: string) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `há ${diff} dias`
}

function formatDateBR(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('pt-BR')
}

function sanitizePhone(phone?: string) {
  return (phone ?? '').replace(/\D/g, '')
}

function getSuggestedAction(
  customer: CustomerSummary,
  rel: CustomerRelationship | undefined,
): string {
  if (!customer.phone || sanitizePhone(customer.phone).length < 8) {
    return 'Telefone não informado. Atualize o cadastro quando possível.'
  }
  if (isFollowUpOverdue(rel)) {
    return 'Fazer follow-up combinado.'
  }
  if (rel?.tags?.includes('VIP') || isVip(customer)) {
    return 'Enviar atendimento personalizado.'
  }
  if (hasPaymentPending(customer)) {
    return 'Confirmar pagamento pendente.'
  }
  if (isInactive(customer)) {
    return 'Enviar convite para voltar.'
  }
  if (isRecurring(customer)) {
    return 'Oferecer novidade ou cupom.'
  }
  return 'Enviar mensagem de boas-vindas.'
}

export function SellerCustomersPage() {
  const { storeId } = useMockSession()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [relationships, setRelationships] = useState<Map<string, CustomerRelationship>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<CustomerFilter>('all')
  const [selectedSort, setSelectedSort] = useState<CustomerSort>('last_order')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Record<string, Order[]>>({})

  // CRM edit state per customer
  const [crmDraft, setCrmDraft] = useState<
    Record<string, { notes: string; preferences: string; preferredContactTime: string; nextFollowUpAt: string; tags: string[]; customTagInput: string }>
  >({})
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())

  const refresh = useCallback(() => {
    getStoreCustomers(storeId).then(setCustomers)
    getStoreById(storeId).then(setStore)
    getCustomerRelationshipsByStore(storeId).then((rels) => {
      const map = new Map<string, CustomerRelationship>()
      rels.forEach((r) => map.set(r.customerKey, r))
      setRelationships(map)
    })
  }, [storeId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Initialize CRM draft when a customer is expanded
  const initDraft = useCallback((key: string, rel?: CustomerRelationship) => {
    setCrmDraft((prev) => {
      if (prev[key]) return prev
      return {
        ...prev,
        [key]: {
          notes: rel?.notes ?? '',
          preferences: rel?.preferences ?? '',
          preferredContactTime: rel?.preferredContactTime ?? '',
          nextFollowUpAt: rel?.nextFollowUpAt ? rel.nextFollowUpAt.substring(0, 10) : '',
          tags: rel?.tags ?? [],
          customTagInput: '',
        },
      }
    })
  }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const termDigits = term.replace(/\D/g, '')

    return customers.filter((c) => {
      const rel = relationships.get(c.key)
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'new' && isNew(c)) ||
        (selectedFilter === 'recurring' && isRecurring(c)) ||
        (selectedFilter === 'payment_pending' && hasPaymentPending(c)) ||
        (selectedFilter === 'inactive' && isInactive(c)) ||
        (selectedFilter === 'top_spenders' && c.totalSpent >= VIP_SPENT_THRESHOLD) ||
        (selectedFilter === 'with_notes' && !!rel?.notes?.trim()) ||
        (selectedFilter === 'with_followup' && !!rel?.nextFollowUpAt) ||
        (selectedFilter === 'followup_overdue' && isFollowUpOverdue(rel)) ||
        (selectedFilter === 'with_tags' && (rel?.tags?.length ?? 0) > 0)

      if (!matchesFilter) return false
      if (!term) return true

      const sanitizedPhone = (c.phone ?? '').replace(/\D/g, '')
      return (
        c.name.toLowerCase().includes(term) ||
        (c.phone ?? '').toLowerCase().includes(term) ||
        (termDigits.length > 0 && sanitizedPhone.includes(termDigits))
      )
    })
  }, [customers, relationships, searchTerm, selectedFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (selectedSort === 'last_order') {
        return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
      }
      if (selectedSort === 'total_spent') {
        return b.totalSpent - a.totalSpent
      }
      if (selectedSort === 'total_orders') {
        return b.totalOrders - a.totalOrders
      }
      if (selectedSort === 'next_followup') {
        const ra = relationships.get(a.key)?.nextFollowUpAt
        const rb = relationships.get(b.key)?.nextFollowUpAt
        if (!ra && !rb) return 0
        if (!ra) return 1
        if (!rb) return -1
        return new Date(ra).getTime() - new Date(rb).getTime()
      }
      if (selectedSort === 'last_contacted') {
        const ra = relationships.get(a.key)?.lastContactedAt
        const rb = relationships.get(b.key)?.lastContactedAt
        if (!ra && !rb) return 0
        if (!ra) return 1
        if (!rb) return -1
        return new Date(rb).getTime() - new Date(ra).getTime()
      }
      return 0
    })
  }, [filtered, selectedSort, relationships])

  const handleToggleHistory = async (key: string) => {
    if (expandedKey === key) {
      setExpandedKey(null)
      return
    }

    setExpandedKey(key)
    initDraft(key, relationships.get(key))

    if (!customerOrders[key]) {
      const orders = await getCustomerOrdersByKey(storeId, key)
      setCustomerOrders((prev) => ({ ...prev, [key]: orders }))
    }
  }

  const handleSaveProfile = async (customerKey: string) => {
    const draft = crmDraft[customerKey]
    if (!draft) return

    const nextFollowUpAt = draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : undefined

    const updated = await updateCustomerRelationship(storeId, customerKey, {
      notes: draft.notes.trim() || undefined,
      preferences: draft.preferences.trim() || undefined,
      preferredContactTime: draft.preferredContactTime.trim() || undefined,
      nextFollowUpAt,
      tags: draft.tags.length > 0 ? draft.tags : undefined,
    })

    setRelationships((prev) => {
      const next = new Map(prev)
      next.set(customerKey, updated)
      return next
    })

    setSavedKeys((prev) => {
      const next = new Set(prev)
      next.add(customerKey)
      return next
    })
    setTimeout(() => {
      setSavedKeys((prev) => {
        const next = new Set(prev)
        next.delete(customerKey)
        return next
      })
    }, 2000)
  }

  const toggleTag = (customerKey: string, tag: string) => {
    setCrmDraft((prev) => {
      const d = prev[customerKey]
      if (!d) return prev
      const tags = d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag]
      return { ...prev, [customerKey]: { ...d, tags } }
    })
  }

  const addCustomTag = (customerKey: string) => {
    setCrmDraft((prev) => {
      const d = prev[customerKey]
      if (!d) return prev
      const tag = d.customTagInput.trim()
      if (!tag || d.tags.includes(tag)) return { ...prev, [customerKey]: { ...d, customTagInput: '' } }
      return { ...prev, [customerKey]: { ...d, tags: [...d.tags, tag], customTagInput: '' } }
    })
  }

  const openWhatsApp = (customer: CustomerSummary, message: string) => {
    const phone = sanitizePhone(customer.phone)
    if (phone.length < 8) return
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(link, '_blank', 'noopener,noreferrer')
    // Register last contacted
    updateCustomerRelationship(storeId, customer.key, {
      lastContactedAt: new Date().toISOString(),
    }).then((updated) => {
      setRelationships((prev) => {
        const next = new Map(prev)
        next.set(customer.key, updated)
        return next
      })
    })
  }

  const buildMessage = (template: string, customer: CustomerSummary): string => {
    const nome = customer.name || 'cliente'
    const storeName = store?.name ?? 'nossa loja'
    const storefrontUrl = store?.slug ? buildPublicUrl(`/loja/${store.slug}`) : ''
    return template
      .replace(/{nome}/g, nome)
      .replace(/{storeName}/g, storeName)
      .replace(/{storefrontUrl}/g, storefrontUrl)
  }

  const handleSendReturn = (customer: CustomerSummary) => {
    const msg = buildMessage(
      'Olá, {nome}! Aqui é da loja {storeName}. Temos novidades e ofertas para você. Quer dar uma olhada na nossa vitrine? {storefrontUrl}',
      customer,
    )
    openWhatsApp(customer, msg)
  }

  const handleSendCoupon = (customer: CustomerSummary) => {
    const msg = buildMessage(
      'Olá, {nome}! Temos um cupom especial para você usar na loja {storeName}. Acesse nossa vitrine: {storefrontUrl}',
      customer,
    )
    openWhatsApp(customer, msg)
  }

  const handleCopyPhone = async (customerKey: string, phone: string) => {
    try {
      await window.navigator.clipboard.writeText(phone)
      setCopiedKey(customerKey)
      setTimeout(() => setCopiedKey((prev) => (prev === customerKey ? null : prev)), 2000)
    } catch {
      // silently fail
    }
  }

  const messageTemplates = (customer: CustomerSummary) => [
    {
      label: 'Boas-vindas',
      message: buildMessage(
        'Olá, {nome}! Obrigado por comprar na {storeName}. Salve nossa vitrine para pedir com mais facilidade: {storefrontUrl}',
        customer,
      ),
    },
    {
      label: 'Cliente recorrente',
      message: buildMessage(
        'Olá, {nome}! Vi que você já comprou com a gente antes. Temos novidades na {storeName}: {storefrontUrl}',
        customer,
      ),
    },
    {
      label: 'Cliente inativo',
      message: buildMessage(
        'Olá, {nome}! Sentimos sua falta por aqui. Dá uma olhada nas novidades da {storeName}: {storefrontUrl}',
        customer,
      ),
    },
    {
      label: 'VIP',
      message: buildMessage(
        'Olá, {nome}! Você é um cliente especial para a {storeName}. Separei nossa vitrine para você acompanhar novidades: {storefrontUrl}',
        customer,
      ),
    },
    {
      label: 'Pagamento pendente',
      message: buildMessage(
        'Olá, {nome}! Passando para confirmar o pagamento pendente do seu pedido na {storeName}. Posso te ajudar por aqui?',
        customer,
      ),
    },
    {
      label: 'Follow-up',
      message: buildMessage(
        'Olá, {nome}! Estou passando conforme combinado para dar continuidade ao seu atendimento na {storeName}.',
        customer,
      ),
    },
  ]

  const filters: Array<{ key: CustomerFilter; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'new', label: 'Novos' },
    { key: 'recurring', label: 'Recorrentes' },
    { key: 'payment_pending', label: 'Pagamento pendente' },
    { key: 'inactive', label: 'Inativos' },
    { key: 'top_spenders', label: 'Maior gasto' },
    { key: 'with_notes', label: 'Com notas' },
    { key: 'with_followup', label: 'Com próximo contato' },
    { key: 'followup_overdue', label: 'Follow-up vencido' },
    { key: 'with_tags', label: 'Com tags' },
  ]

  const sortOptions: Array<{ key: CustomerSort; label: string }> = [
    { key: 'last_order', label: 'Última compra' },
    { key: 'total_spent', label: 'Total gasto' },
    { key: 'total_orders', label: 'Qtd. pedidos' },
    { key: 'next_followup', label: 'Próximo contato' },
    { key: 'last_contacted', label: 'Último contato' },
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

      {customers.length === 0 && (
        <Card
          variant="layered"
          title="Você ainda não tem clientes nesta loja."
          subtitle="Quando clientes fizerem pedidos pela sua vitrine, eles aparecerão aqui com histórico, total gasto e ações de relacionamento."
        >
          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            <Button type="button" variant="primary" onClick={() => navigate('/lojista/minha-vitrine')}>
              Compartilhar minha vitrine
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/lojista/pedidos')}>
              Ver pedidos
            </Button>
          </div>
        </Card>
      )}

      {customers.length > 0 && sorted.length === 0 && (
        <Card variant="layered" title="Nenhum cliente encontrado" subtitle="Sua busca ou filtro não retornou resultados." />
      )}

      <div className="grid">
        {sorted.map((customer) => {
          const isExpanded = expandedKey === customer.key
          const orders = customerOrders[customer.key] ?? []
          const rel = relationships.get(customer.key)
          const draft = crmDraft[customer.key]
          const hasPhone = !!(customer.phone && sanitizePhone(customer.phone).length >= 8)
          const templates = messageTemplates(customer)
          const followupOverdue = isFollowUpOverdue(rel)

          return (
            <Card
              key={customer.key}
              variant="layered"
              title={customer.name}
              subtitle={customer.phone ?? 'Sem telefone cadastrado'}
            >
              {/* Badges automáticos */}
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {isVip(customer) && <Badge variant="accent">⭐ VIP</Badge>}
                {isRecurring(customer) && !isVip(customer) && <Badge variant="success">Recorrente</Badge>}
                {isNew(customer) && <Badge variant="muted">Novo</Badge>}
                {hasPaymentPending(customer) && <Badge variant="danger">Pagamento pendente</Badge>}
                {isInactive(customer) && <Badge variant="muted">Inativo</Badge>}
                {/* CRM badges */}
                {rel?.tags?.map((tag) => (
                  <Badge key={tag} variant="accent">{tag}</Badge>
                ))}
                {rel?.notes?.trim() && <Badge variant="muted">📝 Com notas</Badge>}
                {rel?.nextFollowUpAt && (
                  <Badge variant={followupOverdue ? 'danger' : 'muted'}>
                    {followupOverdue ? '⚠️ Follow-up vencido' : `📅 Follow-up: ${formatDateBR(rel.nextFollowUpAt)}`}
                  </Badge>
                )}
                {rel?.lastContactedAt && (
                  <Badge variant="muted">📞 Contactado: {formatRelativeDate(rel.lastContactedAt)}</Badge>
                )}
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
                  {isExpanded ? 'Fechar detalhes' : 'Ver detalhes'}
                </Button>
                {hasPhone && (
                  <>
                    <Button type="button" variant="primary" onClick={() => handleSendReturn(customer)}>
                      Chamar no WhatsApp
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleSendCoupon(customer)}>
                      Enviar cupom
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleCopyPhone(customer.key, customer.phone!)}>
                      {copiedKey === customer.key ? 'Copiado!' : 'Copiar telefone'}
                    </Button>
                  </>
                )}
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="stack" style={{ marginTop: '1rem', gap: '1.25rem' }}>

                  {/* Próxima ação sugerida */}
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'var(--color-surface-2, #f9fafb)',
                      border: '1px solid var(--color-border, #e5e7eb)',
                    }}
                  >
                    <small style={{ fontWeight: 600 }}>💡 Próxima ação sugerida</small>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                      {getSuggestedAction(customer, rel)}
                    </p>
                  </div>

                  {/* Perfil do cliente (CRM) */}
                  {draft && (
                    <div className="stack" style={{ gap: '0.75rem' }}>
                      <small className="muted" style={{ fontWeight: 600 }}>
                        Perfil do cliente
                      </small>

                      <div className="stack" style={{ gap: '0.35rem' }}>
                        <small className="muted">Anotações internas</small>
                        <textarea
                          rows={3}
                          placeholder="Observações sobre este cliente (não visível ao cliente)"
                          value={draft.notes}
                          onChange={(e) =>
                            setCrmDraft((prev) => ({
                              ...prev,
                              [customer.key]: { ...prev[customer.key], notes: e.target.value },
                            }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            background: 'var(--color-surface, #fff)',
                            color: 'inherit',
                          }}
                        />
                      </div>

                      <div className="stack" style={{ gap: '0.35rem' }}>
                        <small className="muted">Preferências do cliente</small>
                        <input
                          type="text"
                          placeholder="Ex.: prefere Pix, gosta de kits especiais..."
                          value={draft.preferences}
                          onChange={(e) =>
                            setCrmDraft((prev) => ({
                              ...prev,
                              [customer.key]: { ...prev[customer.key], preferences: e.target.value },
                            }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            fontSize: '0.875rem',
                            background: 'var(--color-surface, #fff)',
                            color: 'inherit',
                          }}
                        />
                      </div>

                      <div className="stack" style={{ gap: '0.35rem' }}>
                        <small className="muted">Melhor horário para contato</small>
                        <input
                          type="text"
                          placeholder="Ex.: tarde, após 18h..."
                          value={draft.preferredContactTime}
                          onChange={(e) =>
                            setCrmDraft((prev) => ({
                              ...prev,
                              [customer.key]: { ...prev[customer.key], preferredContactTime: e.target.value },
                            }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            fontSize: '0.875rem',
                            background: 'var(--color-surface, #fff)',
                            color: 'inherit',
                          }}
                        />
                      </div>

                      <div className="stack" style={{ gap: '0.35rem' }}>
                        <small className="muted">Próximo contato</small>
                        <input
                          type="date"
                          value={draft.nextFollowUpAt}
                          onChange={(e) =>
                            setCrmDraft((prev) => ({
                              ...prev,
                              [customer.key]: { ...prev[customer.key], nextFollowUpAt: e.target.value },
                            }))
                          }
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            fontSize: '0.875rem',
                            background: 'var(--color-surface, #fff)',
                            color: 'inherit',
                          }}
                        />
                      </div>

                      {/* Tags */}
                      <div className="stack" style={{ gap: '0.35rem' }}>
                        <small className="muted">Tags</small>
                        <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.375rem' }}>
                          {PREDEFINED_TAGS.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(customer.key, tag)}
                              style={{
                                padding: '0.25rem 0.625rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                border: '1px solid var(--color-border, #e5e7eb)',
                                cursor: 'pointer',
                                background: draft.tags.includes(tag)
                                  ? 'var(--color-accent, #3a86ff)'
                                  : 'var(--color-surface-2, #f9fafb)',
                                color: draft.tags.includes(tag) ? '#fff' : 'inherit',
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className="inline-info" style={{ gap: '0.5rem', marginTop: '0.25rem' }}>
                          <input
                            type="text"
                            placeholder="Tag personalizada"
                            value={draft.customTagInput}
                            onChange={(e) =>
                              setCrmDraft((prev) => ({
                                ...prev,
                                [customer.key]: { ...prev[customer.key], customTagInput: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomTag(customer.key)
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '0.375rem 0.625rem',
                              borderRadius: '0.375rem',
                              border: '1px solid var(--color-border, #e5e7eb)',
                              fontSize: '0.875rem',
                              background: 'var(--color-surface, #fff)',
                              color: 'inherit',
                            }}
                          />
                          <Button type="button" variant="ghost" onClick={() => addCustomTag(customer.key)}>
                            Adicionar
                          </Button>
                        </div>
                        {/* Custom tags already in list but not in predefined */}
                        {draft.tags.filter((t) => !PREDEFINED_TAGS.includes(t)).length > 0 && (
                          <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
                            {draft.tags
                              .filter((t) => !PREDEFINED_TAGS.includes(t))
                              .map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(customer.key, tag)}
                                  style={{
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    border: '1px solid var(--color-border, #e5e7eb)',
                                    cursor: 'pointer',
                                    background: 'var(--color-accent, #3a86ff)',
                                    color: '#fff',
                                  }}
                                >
                                  {tag} ×
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => handleSaveProfile(customer.key)}
                        >
                          {savedKeys.has(customer.key) ? '✓ Perfil salvo' : 'Salvar perfil do cliente'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Mensagens prontas */}
                  <div className="stack" style={{ gap: '0.5rem' }}>
                    <small className="muted" style={{ fontWeight: 600 }}>
                      Mensagens prontas de relacionamento
                    </small>
                    {!hasPhone && (
                      <small className="muted">Telefone do cliente não informado.</small>
                    )}
                    <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      {templates.map((tpl) => (
                        <Button
                          key={tpl.label}
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            if (hasPhone) openWhatsApp(customer, tpl.message)
                          }}
                          disabled={!hasPhone}
                        >
                          {tpl.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Histórico de pedidos */}
                  <div className="stack" style={{ gap: '0.75rem' }}>
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

                        {hasPhone && (
                          <div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                const phone = sanitizePhone(customer.phone)
                                const msg = `Olá, ${customer.name}! Referente ao seu pedido de ${new Date(order.createdAt).toLocaleDateString('pt-BR')} — ${formatCurrency(order.total)}. Posso ajudar com algo?`
                                const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                                window.open(link, '_blank', 'noopener,noreferrer')
                                updateCustomerRelationship(storeId, customer.key, {
                                  lastContactedAt: new Date().toISOString(),
                                }).then((updated) => {
                                  setRelationships((prev) => {
                                    const next = new Map(prev)
                                    next.set(customer.key, updated)
                                    return next
                                  })
                                })
                              }}
                            >
                              Chamar cliente sobre este pedido
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}

