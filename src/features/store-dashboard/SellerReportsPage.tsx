import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { KpiCard } from '../../components/ui/KpiCard'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import {
  getCouponPerformanceByStore,
  getOrderStatusSummaryByStore,
  getPaymentSummaryByStore,
  getStoreById,
  getStoreCustomers,
  getStoreReportSummary,
  getTopProductsByStore,
} from '../../services/mockData'
import type {
  CouponPerformance,
  CustomerSummary,
  OrderStatusEntry,
  PaymentStatusEntry,
  ReportPeriod,
  StoreReportSummary,
  TopProduct,
} from '../../services/mockData'
import type { Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const PERIOD_OPTIONS: Array<{ key: ReportPeriod; label: string }> = [
  { key: 'today', label: 'Hoje' },
  { key: 'seven_days', label: '7 dias' },
  { key: 'thirty_days', label: '30 dias' },
  { key: 'all', label: 'Tudo' },
]

function paymentStatusBadgeVariant(status: string): 'success' | 'danger' | 'accent' | 'muted' {
  if (status === 'paid') return 'success'
  if (status === 'failed' || status === 'refunded') return 'danger'
  if (status === 'to_be_arranged') return 'accent'
  return 'muted'
}

function orderStatusBadgeVariant(status: string): 'success' | 'danger' | 'accent' | 'muted' {
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'preparing' || status === 'paid') return 'accent'
  return 'muted'
}

function buildExportText(
  store: Store | undefined,
  period: ReportPeriod,
  summary: StoreReportSummary,
  topProducts: TopProduct[],
  coupons: CouponPerformance[],
  payments: PaymentStatusEntry[],
  orderStatuses: OrderStatusEntry[],
): string {
  const periodLabel = PERIOD_OPTIONS.find((p) => p.key === period)?.label ?? period
  const lines: string[] = [
    `Relatório da loja: ${store?.name ?? '—'}`,
    `Período: ${periodLabel}`,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    '',
    '=== KPIs ===',
    `Pedidos totais: ${summary.totalOrders}`,
    `Entregues: ${summary.deliveredOrders}`,
    `Cancelados: ${summary.cancelledOrders}`,
    `Faturamento confirmado: ${formatCurrency(summary.confirmedRevenue)}`,
    `A receber: ${formatCurrency(summary.pendingRevenue)}`,
    `Ticket médio: ${formatCurrency(summary.averageTicket)}`,
    `Clientes únicos: ${summary.uniqueCustomers}`,
    `Clientes recorrentes: ${summary.recurringCustomers}`,
    `Produtos vendidos: ${summary.totalProductsSold}`,
    `Descontos concedidos: ${formatCurrency(summary.totalDiscounts)}`,
    '',
    '=== Produtos mais vendidos ===',
    ...topProducts.map(
      (p) => `${p.productName} — ${p.quantitySold} unid. — ${formatCurrency(p.revenue)}`,
    ),
    '',
    '=== Cupons ===',
    ...coupons.map(
      (c) => `${c.code} — ${c.usageCount} usos — desconto ${formatCurrency(c.totalDiscount)}`,
    ),
    '',
    '=== Pagamentos ===',
    ...payments.map((p) => `${p.label}: ${p.count} pedidos — ${formatCurrency(p.total)}`),
    '',
    '=== Status dos pedidos ===',
    ...orderStatuses.map((s) => `${s.label}: ${s.count} pedidos — ${formatCurrency(s.total)}`),
  ]
  return lines.join('\n')
}

export function SellerReportsPage() {
  const { storeId } = useMockSession()
  const [period, setPeriod] = useState<ReportPeriod>('thirty_days')
  const [store, setStore] = useState<Store | undefined>()
  const [summary, setSummary] = useState<StoreReportSummary | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [coupons, setCoupons] = useState<CouponPerformance[]>([])
  const [payments, setPayments] = useState<PaymentStatusEntry[]>([])
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusEntry[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [exportMessage, setExportMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getStoreById(storeId),
      getStoreReportSummary(storeId, period),
      getTopProductsByStore(storeId, period),
      getCouponPerformanceByStore(storeId, period),
      getPaymentSummaryByStore(storeId, period),
      getOrderStatusSummaryByStore(storeId, period),
      getStoreCustomers(storeId),
    ]).then(([s, sum, top, coup, pay, ord, custs]) => {
      if (cancelled) return
      setStore(s)
      setSummary(sum)
      setTopProducts(top)
      setCoupons(coup)
      setPayments(pay)
      setOrderStatuses(ord)
      setCustomers(custs)
    })
    return () => {
      cancelled = true
    }
  }, [storeId, period])

  const topBuyer =
    customers.length > 0
      ? customers.reduce((best, c) => (c.totalSpent > best.totalSpent ? c : best))
      : null

  const mostRecurring =
    customers.length > 0
      ? customers.reduce((best, c) => (c.totalOrders > best.totalOrders ? c : best))
      : null

  const pendingPaymentCustomers = customers.filter((c) => c.paymentPendingCount > 0)

  const handleExport = () => {
    if (!summary) return
    const text = buildExportText(store, period, summary, topProducts, coupons, payments, orderStatuses)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${store?.slug ?? 'loja'}-${period}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExportMessage('Relatório exportado com sucesso.')
    setTimeout(() => setExportMessage(''), 3000)
  }

  const loading = summary === null

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Relatórios"
        icon="chart"
        title={`Relatórios de ${store?.name ?? 'sua loja'}`}
        description="Analise vendas, produtos, cupons e desempenho da sua loja."
      />

      {/* Period filter */}
      <Card variant="layered" title="Período" subtitle="Filtre os dados pelo intervalo desejado.">
        <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              type="button"
              variant={period === opt.key ? 'primary' : 'ghost'}
              onClick={() => setPeriod(opt.key)}
            >
              {opt.label}
            </Button>
          ))}
          <Button type="button" variant="secondary" onClick={handleExport} disabled={loading || !summary}>
            Exportar resumo
          </Button>
        </div>
        {exportMessage && <p className="muted" style={{ marginTop: '0.5rem' }}>{exportMessage}</p>}
      </Card>

      {loading && (
        <Card variant="layered" title="Carregando..." subtitle="Calculando os dados do período selecionado." />
      )}

      {!loading && summary && (
        <>
          {/* KPIs */}
          <div className="grid grid-metrics">
            <KpiCard label="Pedidos totais" value={summary.totalOrders} icon="cart" />
            <KpiCard label="Entregues" value={summary.deliveredOrders} icon="check" />
            <KpiCard label="Cancelados" value={summary.cancelledOrders} icon="close" />
            <KpiCard label="Faturamento confirmado" value={formatCurrency(summary.confirmedRevenue)} icon="wallet" />
            <KpiCard label="A receber" value={formatCurrency(summary.pendingRevenue)} icon="tag" />
            <KpiCard label="Ticket médio" value={formatCurrency(summary.averageTicket)} icon="wallet" />
            <KpiCard label="Clientes únicos" value={summary.uniqueCustomers} icon="user" />
            <KpiCard label="Clientes recorrentes" value={summary.recurringCustomers} icon="user" />
            <KpiCard label="Produtos vendidos" value={summary.totalProductsSold} icon="package" />
            <KpiCard label="Descontos concedidos" value={formatCurrency(summary.totalDiscounts)} icon="tag" />
          </div>

          {/* Top products */}
          <Card variant="layered" title="Produtos mais vendidos" subtitle="Ranking por quantidade vendida no período.">
            {topProducts.length === 0 ? (
              <p className="muted">Nenhum produto vendido neste período.</p>
            ) : (
              <div className="stack" style={{ gap: '0.75rem' }}>
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="inline-info"
                    style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}
                  >
                    <div className="inline-info" style={{ gap: '0.5rem' }}>
                      <span className="muted" style={{ minWidth: '1.5rem', textAlign: 'right' }}>
                        {index + 1}.
                      </span>
                      <div className="stack" style={{ gap: '0.1rem' }}>
                        <strong>{product.productName}</strong>
                        <small className="muted">{product.orderCount} pedido{product.orderCount !== 1 ? 's' : ''}</small>
                      </div>
                    </div>
                    <div className="inline-info" style={{ gap: '0.5rem' }}>
                      <Badge variant={product.isActive ? 'success' : 'muted'}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <div className="stack" style={{ gap: '0.1rem', textAlign: 'right' }}>
                        <strong>{product.quantitySold} unid.</strong>
                        <small className="muted">{formatCurrency(product.revenue)}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Coupons */}
          <Card variant="layered" title="Desempenho dos cupons" subtitle="Cupons da loja e utilização no período.">
            {coupons.length === 0 ? (
              <p className="muted">Nenhum cupom cadastrado.</p>
            ) : (
              <div className="stack" style={{ gap: '0.75rem' }}>
                {coupons.map((coupon) => (
                  <div
                    key={coupon.couponId}
                    className="inline-info"
                    style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}
                  >
                    <div className="inline-info" style={{ gap: '0.5rem' }}>
                      <strong style={{ fontFamily: 'monospace' }}>{coupon.code}</strong>
                      <Badge variant={coupon.active ? 'success' : 'muted'}>
                        {coupon.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="grid grid-metrics" style={{ gap: '0.5rem' }}>
                      <div className="stack" style={{ gap: '0.1rem', textAlign: 'right' }}>
                        <small className="muted">Usos</small>
                        <strong>{coupon.usageCount}</strong>
                      </div>
                      <div className="stack" style={{ gap: '0.1rem', textAlign: 'right' }}>
                        <small className="muted">Desconto</small>
                        <strong>{formatCurrency(coupon.totalDiscount)}</strong>
                      </div>
                      <div className="stack" style={{ gap: '0.1rem', textAlign: 'right' }}>
                        <small className="muted">Receita</small>
                        <strong>{formatCurrency(coupon.associatedRevenue)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payment summary */}
          <Card variant="layered" title="Resumo de pagamentos" subtitle="Distribuição por status de pagamento.">
            <div className="stack" style={{ gap: '0.5rem' }}>
              {payments.map((entry) => (
                <div
                  key={entry.status}
                  className="inline-info"
                  style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}
                >
                  <div className="inline-info" style={{ gap: '0.5rem' }}>
                    <Badge variant={paymentStatusBadgeVariant(entry.status)}>{entry.label}</Badge>
                    <small className="muted">{entry.count} pedido{entry.count !== 1 ? 's' : ''}</small>
                  </div>
                  <strong>{formatCurrency(entry.total)}</strong>
                </div>
              ))}
            </div>
          </Card>

          {/* Order status summary */}
          <Card variant="layered" title="Status dos pedidos" subtitle="Distribuição por status no período.">
            <div className="stack" style={{ gap: '0.5rem' }}>
              {orderStatuses.map((entry) => (
                <div
                  key={entry.status}
                  className="inline-info"
                  style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}
                >
                  <div className="inline-info" style={{ gap: '0.5rem' }}>
                    <Badge variant={orderStatusBadgeVariant(entry.status)}>{entry.label}</Badge>
                    <small className="muted">{entry.count} pedido{entry.count !== 1 ? 's' : ''}</small>
                  </div>
                  <strong>{formatCurrency(entry.total)}</strong>
                </div>
              ))}
            </div>
          </Card>

          {/* Customers mini-ranking */}
          <Card variant="layered" title="Clientes em destaque" subtitle="Destaques da base de clientes da loja.">
            {customers.length === 0 ? (
              <p className="muted">Nenhum cliente registrado.</p>
            ) : (
              <div className="stack" style={{ gap: '0.75rem' }}>
                {topBuyer && (
                  <div className="inline-info" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="inline-info" style={{ gap: '0.5rem' }}>
                      <Badge variant="accent">💰 Maior comprador</Badge>
                      <strong>{topBuyer.name}</strong>
                    </div>
                    <small className="muted">{formatCurrency(topBuyer.totalSpent)}</small>
                  </div>
                )}
                {mostRecurring && mostRecurring.totalOrders >= 2 && (
                  <div className="inline-info" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="inline-info" style={{ gap: '0.5rem' }}>
                      <Badge variant="success">🔄 Mais recorrente</Badge>
                      <strong>{mostRecurring.name}</strong>
                    </div>
                    <small className="muted">{mostRecurring.totalOrders} pedidos</small>
                  </div>
                )}
                {pendingPaymentCustomers.length > 0 && (
                  <div className="stack" style={{ gap: '0.5rem' }}>
                    <small className="muted" style={{ fontWeight: 600 }}>
                      Pagamento pendente ({pendingPaymentCustomers.length})
                    </small>
                    {pendingPaymentCustomers.map((c) => (
                      <div
                        key={c.key}
                        className="inline-info"
                        style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}
                      >
                        <div className="inline-info" style={{ gap: '0.5rem' }}>
                          <Badge variant="danger">⏳ Pendente</Badge>
                          <span>{c.name}</span>
                        </div>
                        <small className="muted">{c.paymentPendingCount} pedido{c.paymentPendingCount !== 1 ? 's' : ''}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </section>
  )
}
