import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StoreCard } from '../../components/ui/StoreCard'
import { getStores } from '../../services/mockData'
import type { Store } from '../../types'

export function CustomerHomePage() {
  const [featuredStores, setFeaturedStores] = useState<Store[]>([])

  useEffect(() => {
    getStores().then((stores) => setFeaturedStores(stores.filter((store) => store.isActive)))
  }, [])

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Vitrine"
        icon="sparkles"
        title="Compre em lojas locais com identidade própria"
        description="Descubra marcas da sua região, acompanhe ofertas e finalize pedidos com praticidade."
      />

      <Card variant="layered" title="Comece agora" subtitle="Explore vitrines e encontre o que você precisa">
        <div className="inline-info">
          <span className="muted">Navegação rápida para entrar nas lojas mais ativas.</span>
          <Link to="/cliente/explorar">
            <Button variant="accent" size="lg">
              <Icon name="arrowRight" className="icon-sm" />
              Explorar lojas
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid">
        {featuredStores.map((store) => (
          <StoreCard key={store.id} store={store} ctaLabel="Comprar agora" />
        ))}
      </div>
    </section>
  )
}
