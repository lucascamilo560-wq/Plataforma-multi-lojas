import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getProductsByStore } from '../../services/mockData'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

const STORE_ID = 'store-1'

export function StoreProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProductsByStore(STORE_ID).then(setProducts)
  }, [])

  return (
    <section className="stack-lg">
      <PageHeader
        title="Produtos do lojista"
        description="Catálogo inicial da loja com estrutura pronta para CRUD no Supabase."
      />
      <div className="grid">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            subtitle={`${product.category} · Estoque ${product.stock}`}
          >
            <p>{product.description}</p>
            <strong>{formatCurrency(product.price)}</strong>
          </Card>
        ))}
      </div>
    </section>
  )
}
