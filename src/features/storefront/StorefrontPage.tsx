import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { ProductCard } from '../../components/ui/ProductCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { addProductToCart, getProductsByStore, getStoreBySlug } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Product, Store } from '../../types'

export function StorefrontPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getStoreBySlug(slug).then((nextStore) => {
      setStore(nextStore)
      if (!nextStore) {
        setProducts([])
        return
      }
      getProductsByStore(nextStore.id).then(setProducts)
    })
  }, [slug])

  const handleAddToCart = async (product: Product) => {
    try {
      setErrorMessage('')
      await addProductToCart(product)
      navigate(`/loja/${slug}/carrinho`)
    } catch (error) {
      console.error('Falha ao adicionar item no carrinho:', error)
      setErrorMessage('Não foi possível adicionar o produto ao carrinho. Tente novamente.')
    }
  }

  if (!store) {
    return (
      <section className="stack-lg">
        <SectionHeader
          kicker="Vitrine"
          icon="storefront"
          title="Loja não encontrada"
          description="Este link não está disponível no momento. Verifique o endereço e tente novamente."
        />
      </section>
    )
  }

  const storeTheme = getStoreTheme(store)
  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Olá! Vim pela vitrine da ${store.name}.`)}`
    : null

  return (
    <section className="stack-xl">
      <article
        className="store-hero"
        style={{
          backgroundImage: `linear-gradient(140deg, ${storeTheme.primaryColor}33 0%, ${storeTheme.accentColor}22 100%), url(${storeTheme.coverUrl})`,
        }}
      >
        <div className="store-hero-content">
          {storeTheme.logoUrl && (
            <img src={storeTheme.logoUrl} alt={`Logo da loja ${store.name}`} className="store-hero-logo" />
          )}
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              {store.name}
            </h2>
            <p style={{ margin: '0.2rem 0 0' }}>{store.description}</p>
          </div>
          <div className="inline-info">
            <Badge variant={store.isActive ? 'success' : 'muted'}>
              {store.isActive ? 'Aberta — pronta para receber pedidos' : 'Loja em breve'}
            </Badge>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="store" storeColor={storeTheme.primaryColor}>
                  Falar pelo WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      </article>

      <SectionHeader
        kicker="Vitrine"
        icon="tag"
        title="Produtos da loja"
        description="Escolha seus favoritos e adicione ao carrinho."
      />

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {products.length === 0 ? (
        <p className="empty-state">Nenhum produto ativo no momento. Volte em breve para novas ofertas.</p>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} store={store} onAction={() => handleAddToCart(product)} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={`/loja/${slug}/carrinho`}>
          <Button variant="store" size="lg" storeColor={storeTheme.primaryColor}>
            <Icon name="cart" className="icon-sm" />
            Ver carrinho
          </Button>
        </Link>
      </div>
    </section>
  )
}
