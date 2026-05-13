import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { getAdminPlans, getProductsByStore, getStoreOrders, getStores, updateStoreAdminStatus, updateStorePlan } from '../../services/mockData'
import type { PlatformPlan, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [plans, setPlans] = useState<PlatformPlan[]>([])
  const [metrics, setMetrics] = useState<Record<string, { products: number; gmv: number; confirmed: number; pending: number; commission: number; orders: number }>>({})

  useEffect(() => {
    Promise.all([getStores(), getAdminPlans()]).then(([storeList, planList]) => {
      setStores(storeList)
      setPlans(planList)
      Promise.all(
        storeList.map(async (store) => {
          const [products, orders] = await Promise.all([getProductsByStore(store.id, { includeInactive: true }), getStoreOrders(store.id)])
          const plan = planList.find((item) => item.id === (store.planId ?? 'free'))
          const gmv = orders.reduce((sum, o) => sum + o.total, 0)
          const confirmed = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
          const pending = orders.filter((o) => o.paymentStatus !== 'paid' && o.paymentStatus !== 'failed' && o.paymentStatus !== 'refunded').reduce((sum, o) => sum + o.total, 0)
          const base = (plan?.commissionBase === 'all_orders' ? gmv : confirmed)
          return [store.id, { products: products.length, gmv, confirmed, pending, commission: base * ((plan?.commissionRate ?? 0) / 100), orders: orders.length }] as const
        }),
      ).then((entries) => setMetrics(Object.fromEntries(entries)))
    })
  }, [])

  const planOptions = useMemo(() => plans.map((plan) => ({ id: plan.id, label: plan.name })), [plans])

  return (
    <section className="stack-lg">
      <PageHeader kicker="Lojas" icon="storefront" title="Rede de lojas da plataforma" description="Super Admin gerencia status, plano, assinatura e indicadores gerais por loja." />
      <div className="grid">
        {stores.map((store) => {
          const status = store.adminStatus ?? (store.isActive ? 'active' : 'paused')
          const storeMetrics = metrics[store.id]
          const plan = plans.find((item) => item.id === (store.planId ?? 'free'))

          return (
            <Card key={store.id} title={store.name} subtitle={`${store.city} · ${store.category}`} variant="accentCorner">
              <div className="inline-info" style={{ marginBottom: 12 }}>
                <Badge variant={status === 'active' ? 'success' : status === 'blocked' ? 'danger' : 'muted'}>{status === 'active' ? 'Ativa' : status === 'blocked' ? 'Bloqueada' : 'Pausada'}</Badge>
                <small className="muted">Plano: {plan?.name ?? 'Grátis'}</small>
              </div>
              <p className="muted">Produtos: {storeMetrics?.products ?? 0} · Pedidos: {storeMetrics?.orders ?? 0}</p>
              <p className="muted">GMV: {formatCurrency(storeMetrics?.gmv ?? 0)} · Confirmado: {formatCurrency(storeMetrics?.confirmed ?? 0)}</p>
              <p className="muted">Pendentes: {formatCurrency(storeMetrics?.pending ?? 0)} · Comissão estimada: {formatCurrency(storeMetrics?.commission ?? 0)}</p>
              <p className="muted">Mensalidade do plano: {formatCurrency(plan?.monthlyPrice ?? 0)}</p>
              <div className="inline-actions" style={{ marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                <Button size="sm" variant="secondary" onClick={() => updateStoreAdminStatus(store.id, 'active').then((updated) => updated && setStores((prev) => prev.map((item) => item.id === updated.id ? updated : item)))}>Ativar</Button>
                <Button size="sm" variant="secondary" onClick={() => updateStoreAdminStatus(store.id, 'paused').then((updated) => updated && setStores((prev) => prev.map((item) => item.id === updated.id ? updated : item)))}>Pausar</Button>
                <Button size="sm" variant="danger" onClick={() => updateStoreAdminStatus(store.id, 'blocked').then((updated) => updated && setStores((prev) => prev.map((item) => item.id === updated.id ? updated : item)))}>Bloquear</Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(`/loja/${store.slug}`, '_blank')}>Abrir vitrine</Button>
                <Link to={`/admin/lojas/${store.id}`}><Button size="sm" variant="primary">Ver detalhes</Button></Link>
              </div>
              <Select
                value={store.planId ?? 'free'}
                onChange={(event) => updateStorePlan(store.id, event.target.value).then((updated) => updated && setStores((prev) => prev.map((item) => item.id === updated.id ? updated : item)))}
                containerClassName="stack-xs"
                label="Alterar plano"
              >
                {planOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </Select>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
