import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

interface AdminSectionPageProps {
  kicker: string
  icon: Parameters<typeof PageHeader>[0]['icon']
  title: string
  description: string
  cardTitle: string
  cardSubtitle: string
}

export function AdminSectionPage({
  kicker,
  icon,
  title,
  description,
  cardTitle,
  cardSubtitle,
}: AdminSectionPageProps) {
  return (
    <section className="stack-lg">
      <PageHeader kicker={kicker} icon={icon} title={title} description={description} />
      <Card title={cardTitle} subtitle={cardSubtitle} variant="accentCorner">
        <p className="muted">Acompanhe esta frente de gestão e conduza as decisões operacionais da plataforma.</p>
      </Card>
    </section>
  )
}
