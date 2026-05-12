import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { PageHeader } from '../../components/ui/PageHeader'

export function CheckoutPage() {
  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Finalização"
        icon="check"
        title="Confirme sua compra"
        description="Revise entrega, forma de pagamento e comunicação para concluir o pedido com tranquilidade."
      />

      <div className="grid">
        <Card title="Entrega" subtitle="Escolha o melhor horário" variant="accentCorner">
          <p className="muted">Selecione o endereço e confirme a faixa de recebimento para cada loja do seu pedido.</p>
          <Icon name="clock" className="icon-md" />
        </Card>

        <Card title="Pagamento" subtitle="Confirmação na etapa final" variant="layered">
          <p className="muted">Você revisará os detalhes de pagamento antes de concluir.</p>
          <Icon name="wallet" className="icon-md" />
        </Card>

        <Card title="Acompanhamento" subtitle="Comunicação do pedido" variant="accentCorner">
          <p className="muted">Após concluir, você recebe atualizações de status diretamente no app.</p>
          <Icon name="check" className="icon-md" />
        </Card>
      </div>
    </section>
  )
}
