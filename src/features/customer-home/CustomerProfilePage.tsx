import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

export function CustomerProfilePage() {
  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Perfil"
        icon="user"
        title="Gerencie sua conta"
        description="Atualize seus dados, preferências e endereços para comprar com mais praticidade."
      />
      <Card title="Dados da conta" subtitle="Informações pessoais e preferências" variant="accentCorner">
        <p className="muted">Mantenha seus dados em dia para acelerar seus próximos pedidos.</p>
      </Card>
    </section>
  )
}
