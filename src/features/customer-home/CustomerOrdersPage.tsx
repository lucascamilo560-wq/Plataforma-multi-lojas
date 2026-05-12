import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

export function CustomerOrdersPage() {
  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Meus pedidos"
        icon="clock"
        title="Acompanhe seus pedidos"
        description="Veja o andamento das compras e receba atualizações de cada etapa em um só lugar."
      />
      <Card title="Histórico de pedidos" subtitle="Tudo organizado por data e status" variant="layered">
        <p className="muted">Seus pedidos aparecerão aqui com detalhes de entrega, pagamento e acompanhamento.</p>
      </Card>
    </section>
  )
}
