import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getAdminPlans, getCouponsByStore, getDeliverySettings, getPaymentSettings, getProductsByStore, getPromotionsByStore, getStoreById, getStoreCustomers, getStoreOrders } from '../../services/mockData'
import type { PlatformPlan, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function AdminStoreDetailPage() {
  const { storeId = '' } = useParams()
  const [store, setStore] = useState<Store>()
  const [plan, setPlan] = useState<PlatformPlan>()
  const [data, setData] = useState({ products: 0, orders: 0, uniqueCustomers: 0, activeCoupons: 0, activePromotions: 0, paymentMethods: 0, gmv: 0, confirmed: 0, pending: 0 })

  useEffect(() => {
    Promise.all([getStoreById(storeId), getAdminPlans()]).then(async ([storeValue, plans]) => {
      if (!storeValue) return
      setStore(storeValue)
      setPlan(plans.find((item) => item.id === (storeValue.planId ?? 'free')))
      const [products, orders, customers, coupons, promotions, payments, delivery] = await Promise.all([
        getProductsByStore(storeValue.id, { includeInactive: true }),
        getStoreOrders(storeValue.id),
        getStoreCustomers(storeValue.id),
        getCouponsByStore(storeValue.id),
        getPromotionsByStore(storeValue.id),
        getPaymentSettings(storeValue.id),
        getDeliverySettings(storeValue.id),
      ])
      const gmv = orders.reduce((sum, o) => sum + o.total, 0)
      const confirmed = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
      const pending = orders.filter((o) => o.paymentStatus !== 'paid' && o.paymentStatus !== 'failed' && o.paymentStatus !== 'refunded').reduce((sum, o) => sum + o.total, 0)
      setData({ products: products.length, orders: orders.length, uniqueCustomers: customers.length, activeCoupons: coupons.filter((c) => c.active).length, activePromotions: promotions.filter((p) => p.active).length, paymentMethods: payments.filter((p) => p.enabled).length + (delivery?.deliveryEnabled ? 1 : 0), gmv, confirmed, pending })
    })
  }, [storeId])

  if (!store) return <p className="muted">Loja não encontrada.</p>

  return <section className="stack-lg"><PageHeader kicker="Admin · Loja" icon="storefront" title={store.name} description={`Link público: /loja/${store.slug}`} /><Card title="Dados e plano" subtitle="Configuração da loja na plataforma"><p className="muted">Status: {store.adminStatus ?? (store.isActive ? 'active' : 'paused')} · Plano: {plan?.name ?? 'Grátis'}</p><p className="muted">Mensalidade: {formatCurrency(plan?.monthlyPrice ?? 0)} · Comissão: {plan?.commissionRate ?? 0}%</p></Card><Card title="KPIs da loja" subtitle="Somente indicadores da plataforma"><p className="muted">Produtos: {data.products} · Pedidos: {data.orders} · Clientes únicos: {data.uniqueCustomers}</p><p className="muted">GMV: {formatCurrency(data.gmv)} · Confirmado: {formatCurrency(data.confirmed)} · Pendente: {formatCurrency(data.pending)}</p><p className="muted">Cupons ativos: {data.activeCoupons} · Promoções ativas: {data.activePromotions} · Pagamentos/entrega configurados: {data.paymentMethods}</p></Card></section>
}
