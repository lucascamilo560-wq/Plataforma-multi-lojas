import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

export function CheckoutPage() {
  return (
    <section className="stack-lg">
      <PageHeader
        title="Checkout"
        description="Fluxo inicial para confirmação de dados, endereço e revisão do pedido."
      />

      <div className="grid">
        <Card title="Entrega" subtitle="Configuração mockada para evolução futura.">
          <p>Selecione endereço e janela de entrega por loja.</p>
        </Card>

        <Card title="Pagamento" subtitle="Não implementado nesta etapa.">
          <p>Pagamento real será integrado em próxima fase, com gateway seguro.</p>
        </Card>

        <Card title="Automações" subtitle="Não implementado nesta etapa.">
          <p>Notificações e automações de pós-venda serão conectadas depois.</p>
        </Card>
      </div>
    </section>
  )
}
