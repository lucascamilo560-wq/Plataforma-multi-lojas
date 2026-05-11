import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getStores } from '../../services/mockData'
import type { Store } from '../../types'
import { useEffect, useState } from 'react'

export function CustomerHomePage() {
  const [featuredStores, setFeaturedStores] = useState<Store[]>([])

  useEffect(() => {
    getStores().then((stores) => setFeaturedStores(stores.filter((store) => store.isActive)))
  }, [])

  return (
    <section className="stack-lg">
      <PageHeader
        title="Home do cliente"
        description="Descubra lojas locais, navegue por categorias e finalize pedidos no mesmo app."
      />

      <div className="grid">
        {featuredStores.map((store) => (
          <Card key={store.id} title={store.name} subtitle={`${store.category} · ${store.city}`}>
            <p>{store.description}</p>
            <Link className="btn btn-secondary" to={`/stores/${store.id}`}>
              Ver loja
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
