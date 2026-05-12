import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

interface SellerSectionPageProps {
  title: string
  description: string
  kicker: string
  icon: Parameters<typeof PageHeader>[0]['icon']
  cardTitle: string
  cardSubtitle: string
}

export function SellerSectionPage({
  title,
  description,
  kicker,
  icon,
  cardTitle,
  cardSubtitle,
}: SellerSectionPageProps) {
  return (
    <section className="stack-lg">
      <PageHeader kicker={kicker} icon={icon} title={title} description={description} />
      <Card title={cardTitle} subtitle={cardSubtitle} variant="layered">
        <p className="muted">Use esta área para conduzir as ações do dia e manter a operação da sua loja em ritmo de venda.</p>
      </Card>
    </section>
  )
}
