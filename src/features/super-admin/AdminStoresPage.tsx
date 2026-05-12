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
        kicker="Lojas"
        icon="storefront"
        title="Rede de lojas da plataforma"
        description="Acompanhe o status de cada loja e mantenha a operação local em evolução constante."
      />
      <div className="grid">
        {stores.map((store) => (
          <Card key={store.id} title={store.name} subtitle={`${store.city} · ${store.category}`} variant="accentCorner">
            <div className="inline-info">
              <Badge variant={store.isActive ? 'success' : 'muted'}>
                {store.isActive ? 'Operação ativa' : 'Pausa programada'}
              </Badge>
              <small className="muted">Identificador interno: {store.id}</small>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
