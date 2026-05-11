import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getStores } from '../../services/mockData'
import type { Store } from '../../types'

export function ExploreStoresPage() {
  const [stores, setStores] = useState<Store[]>([])

  useEffect(() => {
    getStores().then(setStores)
  }, [])

  return (
    <section className="stack-lg">
      <PageHeader
        title="Explorar lojas"
        description="Catálogo multi-lojas com base pronta para filtros e busca por região."
      />

      <div className="grid">
        {stores.map((store) => (
          <Card
            key={store.id}
            title={store.name}
            subtitle={`${store.category} · Nota ${store.rating.toFixed(1)}`}
          >
            <p>{store.description}</p>
            <div className="inline-info">
              <span className={`badge ${store.isActive ? 'badge-success' : 'badge-muted'}`}>
                {store.isActive ? 'Ativa' : 'Em pausa'}
              </span>
              <Link to={`/stores/${store.id}`} className="btn btn-secondary">
                Acessar loja
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
