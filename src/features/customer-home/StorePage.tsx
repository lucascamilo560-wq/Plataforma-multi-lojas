import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ProductCard } from '../../components/ui/ProductCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { addProductToCart, getProductsByStore, getStoreById } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Product, Store } from '../../types'

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
      <section className="stack-lg">
        <SectionHeader
          kicker="Loja"
          title="Loja não encontrada"
          description="Verifique o link ou volte para explorar outras lojas da plataforma."
        />
        <Link to="/stores">
          <Button variant="secondary">Voltar para explorar</Button>
        </Link>
      </section>
    )
  }

  const storeTheme = getStoreTheme(store)

  return (
    <section className="stack-xl">
      <SectionHeader kicker="Loja" title={store.name} description={store.description} />

      <Card variant="layered" title="Identidade da loja" subtitle={`${store.category} · ${store.city}`}>
        <div className="inline-info">
          <Badge variant={store.isActive ? 'success' : 'muted'}>
            {store.isActive ? 'Loja ativa' : 'Loja em pausa'}
          </Badge>
          <Button variant="store" storeColor={storeTheme.primaryColor}>
            Seguir loja
          </Button>
        </div>
      </Card>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            store={store}
            onAction={() => handleAddToCart(product)}
          />
        ))}
      </div>
    </section>
  )
}
