import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
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
        kicker="Gestão de lojas"
        icon="storefront"
        title="Rede de lojas parceiras"
        description="Acompanhe ativação das lojas e mantenha a vitrine com padrão visual elevado."
      />
      <div className="grid">
        {stores.map((store) => (
          <Card key={store.id} title={store.name} subtitle={`${store.city} · ${store.category}`} variant="accentCorner">
            <div className="inline-info">
              <Badge variant={store.isActive ? 'success' : 'muted'}>
                {store.isActive ? 'Operação ativa' : 'Pausa programada'}
              </Badge>
              <small className="muted">Código: {store.id}</small>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
