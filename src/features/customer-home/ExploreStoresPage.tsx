import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'

export function ExploreStoresPage() {
  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Explorar"
        icon="search"
        title="Explorar lojas"
        description="Esta área é reservada para lojistas que tornarem suas vitrines públicas no futuro."
      />

      <Card
        variant="default"
        title="Em breve"
        subtitle="Explorar lojas públicas estará disponível futuramente"
      >
        <p className="muted">
          Para acessar uma loja, peça ao lojista o link ou QR Code da vitrine e acesse diretamente pelo link enviado.
        </p>
      </Card>
    </section>
  )
}

