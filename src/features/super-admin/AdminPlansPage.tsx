import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { getAdminPlans, getStores, getStoreOrders, updateAdminPlan } from '../../services/mockData'
import type { PlatformPlan, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function AdminPlansPage() {
  const [plans, setPlans] = useState<PlatformPlan[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [gmvByStore, setGmvByStore] = useState<Record<string, number>>({})

  useEffect(() => {
    getAdminPlans().then(setPlans)
    getStores().then(async (allStores) => {
      setStores(allStores)
      const entries = await Promise.all(allStores.map(async (store) => [store.id, (await getStoreOrders(store.id)).reduce((sum, o) => sum + o.total, 0)] as const))
      setGmvByStore(Object.fromEntries(entries))
    })
  }, [])

  const storesByPlan = useMemo(() => plans.map((plan) => ({ planId: plan.id, count: stores.filter((store) => (store.planId ?? 'free') === plan.id).length })), [plans, stores])

  return <section className="stack-lg"><PageHeader kicker="Financeiro e Planos" icon="wallet" title="Planos, mensalidades e receita da plataforma" description="Sem controlar custos internos do lojista: apenas assinatura/comissão e indicadores da plataforma." />
    <div className="grid">
      {plans.map((plan) => (
        <Card key={plan.id} title={plan.name} subtitle={`Lojas no plano: ${storesByPlan.find((row) => row.planId === plan.id)?.count ?? 0}`} variant="accentCorner">
          <Input type="number" label="Mensalidade" value={plan.monthlyPrice} onChange={(event) => updateAdminPlan(plan.id, { monthlyPrice: Number(event.target.value) }).then((updated) => updated && setPlans((prev) => prev.map((p) => p.id === updated.id ? updated : p)))} />
          <Input type="number" label="Comissão (%)" value={plan.commissionRate} onChange={(event) => updateAdminPlan(plan.id, { commissionRate: Number(event.target.value) }).then((updated) => updated && setPlans((prev) => prev.map((p) => p.id === updated.id ? updated : p)))} />
          <Select label="Base da comissão" value={plan.commissionBase} onChange={(event) => updateAdminPlan(plan.id, { commissionBase: event.target.value as PlatformPlan['commissionBase'] }).then((updated) => updated && setPlans((prev) => prev.map((p) => p.id === updated.id ? updated : p)))}>
            <option value="paid_orders">Somente pedidos pagos</option>
            <option value="all_orders">Todos os pedidos registrados</option>
          </Select>
          <Select label="Status" value={plan.isActive ? 'active' : 'inactive'} onChange={(event) => updateAdminPlan(plan.id, { isActive: event.target.value === 'active' }).then((updated) => updated && setPlans((prev) => prev.map((p) => p.id === updated.id ? updated : p)))}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>
          <p className="muted">Mensalidade atual: {formatCurrency(plan.monthlyPrice)}</p>
        </Card>
      ))}
    </div>
    <Card title="Financeiro da plataforma" subtitle="Mensalidades + comissões estimadas" variant="accentCorner">
      <p className="muted">Mensalidades por plano: {plans.map((plan) => `${plan.name}: ${formatCurrency(plan.monthlyPrice * (storesByPlan.find((row) => row.planId === plan.id)?.count ?? 0))}`).join(' · ')}</p>
      <p className="muted">Ranking por GMV: {stores.sort((a, b) => (gmvByStore[b.id] ?? 0) - (gmvByStore[a.id] ?? 0)).slice(0, 5).map((store) => `${store.name} (${formatCurrency(gmvByStore[store.id] ?? 0)})`).join(' · ')}</p>
      <p className="muted">Assinaturas pendentes (mock): {stores.filter((store) => (store.planId ?? 'free') !== 'free' && (store.adminStatus ?? 'active') !== 'blocked').length}</p>
    </Card>
  </section>
}
