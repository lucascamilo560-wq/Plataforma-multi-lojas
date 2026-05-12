import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { ProductCard } from '../../components/ui/ProductCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import {
  addProductToCart,
  followStore,
  getProductsByStore,
  getPublicStorefront,
  isStoreFollowed,
  registerStoreVisit,
} from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Product, Store } from '../../types'

const APP_DOWNLOAD_URL = 'https://example.com/app'
const FOLLOW_SUCCESS_MESSAGE = 'Loja seguida com sucesso! Agora você acompanha promoções e novidades.'

export function StorefrontPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isFollowed, setIsFollowed] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadStorefront() {
      const nextStore = await getPublicStorefront(slug)
      if (cancelled) return

      setStore(nextStore)
      if (!nextStore) {
        setProducts([])
        return
      }

      await registerStoreVisit(slug)
      const [nextProducts, followed] = await Promise.all([
        getProductsByStore(nextStore.id),
        isStoreFollowed(nextStore.id),
      ])

      if (cancelled) return
      setProducts(nextProducts)
      setIsFollowed(followed)
    }

    loadStorefront()
    return () => {
      cancelled = true
    }
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

  const handleFollowStore = async (successMessage = FOLLOW_SUCCESS_MESSAGE) => {
    if (!store) return
    try {
      setErrorMessage('')
      await followStore(store.id)
      setIsFollowed(true)
      setInfoMessage(successMessage)
    } catch (error) {
      console.error('Falha ao seguir loja:', error)
      setErrorMessage('Não foi possível seguir esta loja agora. Tente novamente.')
    }
  }

  const handleReceivePromotions = async () => {
    try {
      await handleFollowStore('Você começou a receber promoções desta loja.')
    } catch {
      setErrorMessage('Não foi possível ativar promoções neste momento.')
    }
  }

  const handleOpenApp = () => {
    setInfoMessage('Em breve, este link abrirá direto no app.')
  }

  const handleProductAction = async (product: Product) => {
    if (product.productType === 'physical') {
      await handleAddToCart(product)
      return
    }

    if (product.productType === 'service') {
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
        return
      }
      setErrorMessage('Esta loja ainda não configurou WhatsApp. Tente novamente mais tarde.')
      return
    }

    if (!product.externalUrl) {
      setErrorMessage('Este produto ainda não possui link externo disponível.')
      return
    }

    window.open(product.externalUrl, '_blank', 'noopener,noreferrer')
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
  const isOffersTab = searchParams.get('tab') === 'ofertas'
  const productsToDisplay = isOffersTab
    ? products.filter((product) => product.productType === 'external_link' || product.productType === 'affiliate')
    : products
  const hasPhysicalProducts = productsToDisplay.some((product) => product.productType === 'physical')

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

      <Card
        title="Fidelização da loja"
        subtitle="Salve esta loja para acompanhar pedidos, promoções e novidades."
        variant="layered"
      >
        <div className="inline-info">
          <Button variant="accent" onClick={() => handleFollowStore()} disabled={isFollowed}>
            {isFollowed ? 'Loja seguida' : 'Seguir loja'}
          </Button>
          <Button variant="secondary" onClick={handleReceivePromotions}>
            Receber promoções
          </Button>
          <Button variant="secondary" onClick={handleOpenApp}>
            Abrir no app
          </Button>
          <a href={APP_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">Baixar app</Button>
          </a>
        </div>
        {infoMessage && <p className="muted">{infoMessage}</p>}
      </Card>

      <Card
        title="Quer acompanhar esta loja com mais facilidade?"
        subtitle="Use o app para continuar comprando com este lojista."
        variant="accentCorner"
        accentColor={storeTheme.accentColor}
      >
        <div className="inline-info">
          <Button variant="secondary" onClick={handleOpenApp}>
            Abrir no app
          </Button>
          <a href={APP_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">Baixar app</Button>
          </a>
        </div>
      </Card>

      <SectionHeader
        kicker="Vitrine"
        icon="tag"
        title={isOffersTab ? 'Ofertas da loja' : 'Produtos da loja'}
        description={
          isOffersTab
            ? 'Ofertas externas e campanhas da loja para você acompanhar novidades.'
            : 'Escolha seus favoritos para comprar, solicitar ou abrir ofertas externas.'
        }
      />

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {productsToDisplay.length === 0 ? (
        <p className="empty-state">
          {isOffersTab
            ? 'Esta loja ainda não publicou ofertas externas. Volte em breve para novidades.'
            : 'Nenhum produto ativo no momento. Volte em breve para novas ofertas.'}
        </p>
      ) : (
        <div className="grid">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} product={product} store={store} onAction={() => handleProductAction(product)} />
          ))}
        </div>
      )}

      {hasPhysicalProducts && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={`/loja/${slug}/carrinho`}>
            <Button variant="store" size="lg" storeColor={storeTheme.primaryColor}>
              <Icon name="cart" className="icon-sm" />
              Ver carrinho
            </Button>
          </Link>
        </div>
      )}

      <Card title="Publicidade" subtitle="Área mockada de monetização (sem SDK)" variant="default">
        <div className="stack" style={{ gap: '0.6rem' }}>
          <p className="muted">Ofertas recomendadas · Produtos em destaque · Publicidade</p>
          <p className="muted">Espaço demonstrativo, discreto e sem impacto no carrinho, checkout e pedidos.</p>
        </div>
      </Card>
    </section>
  )
}
