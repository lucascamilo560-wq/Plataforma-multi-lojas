import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { addProductToCart, getProductsByStore, getStoreById } from '../../services/mockData'
import type { Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StorePage() {
  const { storeId = '' } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getStoreById(storeId).then(setStore)
    getProductsByStore(storeId).then(setProducts)
  }, [storeId])

  const handleAddToCart = async (product: Product) => {
    try {
      setErrorMessage('')
      await addProductToCart(product)
      navigate('/cart')
    } catch (error) {
      console.error('Falha ao adicionar item no carrinho:', error)
      setErrorMessage('Não foi possível adicionar o produto ao carrinho. Tente novamente.')
    }
  }

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
      <p className="muted">MVP inicial: adição direta no carrinho sem variações e sem cálculo de frete.</p>
      {errorMessage && <p className="error-text">{errorMessage}</p>}

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
              <Button type="button" variant="secondary" onClick={() => handleAddToCart(product)}>
                Adicionar ao carrinho
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
