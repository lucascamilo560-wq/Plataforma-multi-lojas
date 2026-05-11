import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getStores } from '../../services/mockData'
import type { Store } from '../../types'

export function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([])

  useEffect(() => {
    getStores().then(setStores)
  }, [])

  return (
    <section className="stack-lg">
      <PageHeader
        title="Gestão de lojas"
        description="Base inicial para governança multi-tenant e ciclo de ativação das lojas."
      />
      <div className="grid">
        {stores.map((store) => (
          <Card key={store.id} title={store.name} subtitle={`${store.city} · ${store.category}`}>
            <div className="inline-info">
              <span className={`badge ${store.isActive ? 'badge-success' : 'badge-muted'}`}>
                {store.isActive ? 'Ativa' : 'Inativa'}
              </span>
              <small className="muted">store_id: {store.id}</small>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
