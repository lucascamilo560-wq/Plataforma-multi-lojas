import type React from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { ProductCard } from '../../components/ui/ProductCard'
import {
  addProductToCart,
  followStore,
  getActivePromotionsByStore,
  getProductsByStore,
  getPublicStorefront,
  isStoreFollowed,
  registerStoreVisit,
} from '../../services/mockData'
import type { Promotion } from '../../services/localMockStore'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Product, Store } from '../../types'

const APP_DOWNLOAD_URL = 'https://example.com/app'
const FOLLOW_SUCCESS_MESSAGE = 'Loja seguida com sucesso! Agora você acompanha promoções e novidades.'
const WHATSAPP_COLOR = '#25D366'

type StoreNavTab = 'inicio' | 'produtos' | 'promocoes' | 'pedidos' | 'sobre'

const STORE_NAV_ITEMS: { id: StoreNavTab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Início', icon: 'storefront' },
  { id: 'produtos', label: 'Produtos', icon: 'package' },
  { id: 'promocoes', label: 'Promoções', icon: 'tag' },
  { id: 'pedidos', label: 'Meus pedidos', icon: 'cart' },
  { id: 'sobre', label: 'Sobre', icon: 'sparkles' },
]

export function StorefrontPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isFollowed, setIsFollowed] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [activeTab, setActiveTab] = useState<StoreNavTab>('inicio')

  useEffect(() => {
    let cancelled = false

    async function loadStorefront() {
      const nextStore = await getPublicStorefront(slug)
      if (cancelled) return

      setStore(nextStore)
      if (!nextStore) {
        setProducts([])
        setPromotions([])
        return
      }

      await registerStoreVisit(nextStore.slug)
      const [nextProducts, followed, activePromos] = await Promise.all([
        getProductsByStore(nextStore.id),
        isStoreFollowed(nextStore.id),
        getActivePromotionsByStore(nextStore.id),
      ])

      if (cancelled) return
      setProducts(nextProducts)
      setIsFollowed(followed)
      setPromotions(activePromos)
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
      <section className="stack-lg" style={{ padding: '2rem 0' }}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>🏪</p>
          <h2 style={{ margin: '0 0 0.5rem' }}>Loja não encontrada</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Este link não está disponível no momento. Verifique o endereço e tente novamente.
          </p>
        </div>
      </section>
    )
  }

  const storeTheme = getStoreTheme(store)
  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Olá! Vim pela vitrine da ${store.name}.`)}`
    : null

  const activePromos = promotions.filter((p) => p.active)

  const productsToDisplay =
    activeTab === 'promocoes'
      ? products.filter((p) => p.productType === 'external_link' || p.productType === 'affiliate')
      : products

  const hasPhysicalProducts = products.some((p) => p.productType === 'physical')

  // Grid class based on productLayout
  const productGridClass =
    storeTheme.productLayout === 'list'
      ? 'store-product-list'
      : storeTheme.productLayout === 'cards-wide'
        ? 'store-product-wide'
        : 'store-product-grid-2'

  return (
    <div
      className="store-vitrine"
      style={{
        '--store-primary': storeTheme.primaryColor,
        '--store-accent': storeTheme.accentColor,
        '--store-secondary': storeTheme.secondaryColor,
        '--store-btn-radius': storeTheme.buttonRadius,
        '--store-card-radius': storeTheme.borderRadius,
      } as React.CSSProperties}
    >
      {/* Hero */}
      {storeTheme.showHero && (
        <div
          className={`store-vitrine-hero store-vitrine-hero--${storeTheme.heroStyle}`}
          style={{
            backgroundImage:
              storeTheme.heroStyle !== 'minimal'
                ? `linear-gradient(160deg, ${storeTheme.primaryColor}cc 0%, ${storeTheme.primaryColor}99 100%), url(${storeTheme.coverUrl})`
                : undefined,
            background:
              storeTheme.heroStyle === 'minimal'
                ? `linear-gradient(135deg, ${storeTheme.primaryColor} 0%, ${storeTheme.primaryColor}cc 100%)`
                : undefined,
          }}
        >
          <div className="store-vitrine-hero-inner">
            <div className="store-vitrine-hero-identity">
              {storeTheme.logoUrl && (
                <img
                  src={storeTheme.logoUrl}
                  alt={`Logo da loja ${store.name}`}
                  className="store-vitrine-hero-logo"
                />
              )}
              <div>
                <h1 className="store-vitrine-hero-name">{store.name}</h1>
                {store.slogan && (
                  <p className="store-vitrine-hero-slogan">{store.slogan}</p>
                )}
                {!store.slogan && store.description && (
                  <p className="store-vitrine-hero-slogan">{store.description}</p>
                )}
              </div>
            </div>
            <div className="store-vitrine-hero-meta">
              <Badge variant={store.isActive ? 'success' : 'muted'}>
                {store.isActive ? '● Aberta agora' : '○ Em breve'}
              </Badge>
              {store.category && (
                <span className="store-vitrine-hero-category">{store.category}</span>
              )}
            </div>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
                <Button variant="store" storeColor={WHATSAPP_COLOR} style={{ '--store-button-color': WHATSAPP_COLOR } as React.CSSProperties}>
                  <Icon name="sparkles" className="icon-sm" />
                  Falar pelo WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Store Navigation */}
      <div className={`store-vitrine-nav store-vitrine-nav--${storeTheme.navigationStyle}`}>
        {STORE_NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`store-nav-item${isActive ? ' store-nav-item--active' : ''}`}
              style={
                isActive
                  ? ({
                      '--nav-active-bg': storeTheme.primaryColor,
                      '--nav-active-color': '#fff',
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} className="icon-sm" />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="stack-xl store-vitrine-content" style={{ padding: '0 0 5rem' }}>
        {/* Promotions section */}
        {storeTheme.showPromotionsSection && activePromos.length > 0 && (
          <div className="stack" style={{ gap: '0.5rem' }}>
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                style={{
                  background: `linear-gradient(135deg, ${promo.highlightColor ?? storeTheme.primaryColor} 0%, ${storeTheme.accentColor} 100%)`,
                  color: '#fff',
                  padding: '0.85rem 1.1rem',
                  borderRadius: storeTheme.borderRadius,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🎉 {promo.bannerText ?? `${promo.title} — ${promo.description}`}
              </div>
            ))}
          </div>
        )}

        {/* Loyalty block */}
        {storeTheme.showLoyaltyBlock && activeTab === 'inicio' && (
          <div
            style={{
              background: `linear-gradient(135deg, ${storeTheme.primaryColor}12 0%, ${storeTheme.accentColor}0a 100%)`,
              border: `1px solid ${storeTheme.primaryColor}22`,
              borderRadius: storeTheme.borderRadius,
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.2rem', fontSize: '0.98rem' }}>Acompanhe esta loja</h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Salve para acompanhar pedidos, promoções e novidades.
              </p>
            </div>
            <div className="inline-info" style={{ flexWrap: 'wrap' }}>
              <Button
                variant="store"
                size="sm"
                storeColor={storeTheme.primaryColor}
                onClick={() => handleFollowStore()}
                disabled={isFollowed}
                style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
              >
                {isFollowed ? '✓ Loja seguida' : '+ Seguir loja'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReceivePromotions}
                style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
              >
                Receber promoções
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenApp}
                style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
              >
                Abrir no app
              </Button>
            </div>
            {infoMessage && <p className="muted" style={{ margin: 0 }}>{infoMessage}</p>}
          </div>
        )}

        {/* Products tab */}
        {(activeTab === 'inicio' || activeTab === 'produtos' || activeTab === 'promocoes') && (
          <div className="stack">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>
                {activeTab === 'promocoes' ? 'Ofertas da loja' : 'Produtos da loja'}
              </h2>
              {hasPhysicalProducts && (
                <Link to={`/loja/${slug}/carrinho`}>
                  <Button
                    variant="store"
                    size="sm"
                    storeColor={storeTheme.primaryColor}
                    style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                  >
                    <Icon name="cart" className="icon-sm" />
                    Carrinho
                  </Button>
                </Link>
              )}
            </div>

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            {productsToDisplay.length === 0 ? (
              <div className="store-empty-state">
                <p className="empty-state">
                {activeTab === 'promocoes'
                  ? 'Esta loja ainda não publicou ofertas. Volte em breve.'
                  : 'Nenhum produto ativo no momento. Volte em breve.'}
              </p>
              </div>
            ) : (
              <div className={productGridClass}>
                {productsToDisplay.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    store={store}
                    onAction={() => handleProductAction(product)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'pedidos' && (
          <div className="store-empty-state" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📦</p>
            <h3 style={{ margin: '0 0 0.5rem' }}>Meus pedidos</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              Acompanhe os pedidos feitos nesta loja.
            </p>
            <Link to="/cliente/pedidos">
              <Button
                variant="store"
                storeColor={storeTheme.primaryColor}
                style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
              >
                Ver meus pedidos
              </Button>
            </Link>
          </div>
        )}

        {/* About tab */}
        {activeTab === 'sobre' && (
          <div className="stack">
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Sobre a loja</h2>
            <div
              className="store-about-card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-soft)',
                borderRadius: storeTheme.borderRadius,
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              {storeTheme.logoUrl && (
                <img
                  src={storeTheme.logoUrl}
                  alt={store.name}
                  style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--border)' }}
                />
              )}
              <div>
                <h3 style={{ margin: '0 0 0.3rem' }}>{store.name}</h3>
                {store.slogan && <p style={{ margin: '0 0 0.5rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{store.slogan}</p>}
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{store.shortDescription ?? store.description}</p>
              </div>
              <div className="inline-info" style={{ flexWrap: 'wrap' }}>
                {store.category && <Badge variant="accent">{store.category}</Badge>}
                {store.city && <Badge variant="muted">{store.city}</Badge>}
                <Badge variant={store.isActive ? 'success' : 'muted'}>
                  {store.isActive ? 'Aberta' : 'Em breve'}
                </Badge>
              </div>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
                  <Button
                    variant="store"
                    storeColor={storeTheme.primaryColor}
                    style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                  >
                    Falar com a loja
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}

        {/* App download nudge */}
        {activeTab === 'inicio' && (
          <div
            style={{
              background: `linear-gradient(135deg, ${storeTheme.primaryColor} 0%, ${storeTheme.accentColor} 100%)`,
              borderRadius: storeTheme.borderRadius,
              padding: '1.1rem',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.2rem', fontSize: '0.98rem' }}>Compre mais fácil</h3>
              <p style={{ margin: 0, fontSize: '0.86rem', opacity: 0.85 }}>
                Use o app para acompanhar seus pedidos e novidades com mais praticidade.
              </p>
            </div>
            <div className="inline-info" style={{ flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenApp}
                style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
              >
                Abrir no app
              </Button>
              <a href={APP_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                >
                  Baixar app
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>

              {hasPhysicalProducts && (
                <Link to={`/loja/${slug}/carrinho`} className="store-floating-cart" style={{ '--store-cart-color': storeTheme.primaryColor } as React.CSSProperties}>
                  <Icon name="cart" className="icon-md" />
                  <span>Carrinho</span>
                </Link>
              )}

      {/* Floating WhatsApp button */}
      {storeTheme.showWhatsappFloat && whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="store-whatsapp-float"
          aria-label="Falar pelo WhatsApp"
          style={{ background: WHATSAPP_COLOR }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
    </div>
  )
}
