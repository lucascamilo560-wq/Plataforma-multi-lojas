import { useEffect, useMemo, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StoreCard } from '../../components/ui/StoreCard'
import { getStores } from '../../services/mockData'
import type { Store } from '../../types'

export function ExploreStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getStores().then(setStores)
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(stores.map((store) => store.category))),
    [stores],
  )

  const filteredStores = useMemo(
    () =>
      stores.filter((store) =>
        `${store.name} ${store.category} ${store.city}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, stores],
  )

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Descobrir"
        icon="search"
        title="Encontre a loja certa para cada momento"
        description="Busque por categoria, cidade ou nome e navegue por vitrines com personalidade própria."
      />

      <CardSearch query={query} onChange={setQuery} categories={categories} />

      <div className="grid">
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} ctaLabel="Ver vitrine" />
        ))}
      </div>
    </section>
  )
}

function CardSearch({
  query,
  onChange,
  categories,
}: {
  query: string
  onChange: (value: string) => void
  categories: string[]
}) {
  return (
    <div className="card card-layered stack">
      <div className="search-wrap">
        <Input
          id="store-search"
          placeholder="Buscar por loja, categoria ou cidade"
          value={query}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="category-chips">
          {categories.map((category) => (
            <span key={category} className="chip">
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
