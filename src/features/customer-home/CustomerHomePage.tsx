import { useEffect, useState } from 'react'
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
        title="Descubra lojas com experiência premium"
        description="Escolha sua loja, mantenha identidade de marca por seller e compre em um fluxo único mobile-first."
      />

      <div className="grid">
        {featuredStores.map((store) => (
          <StoreCard key={store.id} store={store} ctaLabel="Comprar agora" />
        ))}
      </div>
    </section>
  )
}
