import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
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
          icon="storefront"
          title="Loja não encontrada"
          description="Este link não está disponível no momento. Explore outras vitrines e continue comprando."
        />
        <Link to="/stores">
          <Button variant="secondary">Voltar para lojas</Button>
        </Link>
      </section>
    )
  }

  const storeTheme = getStoreTheme(store)

  return (
    <section className="stack-xl">
      <article
        className="store-hero"
        style={{
          backgroundImage: `linear-gradient(140deg, ${storeTheme.primaryColor}33 0%, ${storeTheme.accentColor}22 100%), url(${storeTheme.coverUrl})`,
        }}
      >
        <div className="store-hero-content">
          <img src={storeTheme.logoUrl} alt={`Logo da loja ${store.name}`} className="store-hero-logo" />
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>{store.name}</h2>
            <p style={{ margin: '0.2rem 0 0' }}>{store.description}</p>
          </div>
          <div className="inline-info">
            <Badge variant={store.isActive ? 'success' : 'muted'}>
              {store.isActive ? 'Entrega no ritmo certo' : 'Agenda de retomada ativa'}
            </Badge>
            <Button variant="store" storeColor={storeTheme.primaryColor}>
              <Icon name="star" className="icon-sm" />
              Seguir loja
            </Button>
          </div>
        </div>
      </article>

      <SectionHeader
        kicker="Vitrine"
        icon="tag"
        title="Produtos em destaque"
        description="Escolha seus favoritos e adicione ao carrinho com poucos toques."
      />

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} store={store} onAction={() => handleAddToCart(product)} />
        ))}
      </div>

      <Card variant="layered" title="Compra contínua" subtitle="Finalize quando quiser, sem perder itens">
        <Link to="/cart">
          <Button variant="store" size="lg" storeColor={storeTheme.primaryColor}>
            <Icon name="cart" className="icon-sm" />
            Ir para carrinho
          </Button>
        </Link>
      </Card>
    </section>
  )
}
