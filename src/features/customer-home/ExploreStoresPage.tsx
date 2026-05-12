import { useEffect, useState } from 'react'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StoreCard } from '../../components/ui/StoreCard'
import { getStores } from '../../services/mockData'
import type { Store } from '../../types'

export function ExploreStoresPage() {
  const [stores, setStores] = useState<Store[]>([])

  useEffect(() => {
    getStores().then(setStores)
  }, [])

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Explorar"
        title="Lojas da plataforma"
        description="Catálogo multi-lojas com padrão visual consistente e espaço para DNA individual de cada marca."
      />

      <div className="grid">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} ctaLabel="Acessar loja" />
        ))}
      </div>
    </section>
  )
}
