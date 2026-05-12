import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getProductsByStore, getStoreById } from '../../services/mockData'
import type { Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StoreProductsPage() {
  const { storeId } = useMockSession()
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()

  useEffect(() => {
    getProductsByStore(storeId).then(setProducts)
    getStoreById(storeId).then(setStore)
  }, [storeId])

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Catálogo"
        icon="package"
        title="Produtos da loja"
        description={`Organize o catálogo de ${store?.name ?? 'sua loja'} com foco em conversão e giro rápido.`}
      />
      <div className="grid">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            subtitle={`${product.category} · ${product.stock} unidades`}
            variant="accentCorner"
          >
            <p className="muted">{product.description}</p>
            <strong>{formatCurrency(product.price)}</strong>
          </Card>
        ))}
      </div>
    </section>
  )
}
