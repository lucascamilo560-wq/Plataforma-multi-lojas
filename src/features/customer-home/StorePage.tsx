import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getProductsByStore, getStoreById } from '../../services/mockData'
import type { Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StorePage() {
  const { storeId = '' } = useParams()
  const [store, setStore] = useState<Store | undefined>()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getStoreById(storeId).then(setStore)
    getProductsByStore(storeId).then(setProducts)
  }, [storeId])

  if (!store) {
    return (
      <section className="stack">
        <PageHeader
          title="Loja não encontrada"
          description="Verifique o link ou explore outras lojas disponíveis."
        />
        <Link className="btn btn-secondary" to="/stores">
          Voltar para explorar
        </Link>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <PageHeader title={store.name} description={store.description} />

      <div className="grid">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            subtitle={`${product.category} · Estoque ${product.stock}`}
          >
            <p>{product.description}</p>
            <div className="inline-info">
              <strong>{formatCurrency(product.price)}</strong>
              <Link className="btn btn-secondary" to="/cart">
                Adicionar ao carrinho
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
