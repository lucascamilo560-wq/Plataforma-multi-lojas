import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import {
  addProductToCart,
  getProductsByStore,
  getPublicStorefront,
  setPendingStoreInvite,
} from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import { buildPublicUrl } from '../../utils/publicUrl'
import { shareOrCopy } from '../../utils/share'
import { formatCurrency } from '../../utils/currency'
import type { Product, Store } from '../../types'

type ShareFeedback = 'shared' | 'copied' | 'cancelled' | 'failed' | null
type CartFeedback = 'added' | null

function getProductBadgeLabel(product: Product) {
  if (product.productType === 'physical') return `${product.stock} disponíveis`
  if (product.productType === 'service') return 'Serviço local'
  if (product.productType === 'external_link') return 'Link externo'
  return 'Afiliado'
}

function getProductPriceLabel(product: Product) {
  if (product.productType === 'service')
    return product.price > 0 ? formatCurrency(product.price) : 'Preço sob consulta'
  return formatCurrency(product.price)
}

const SHARE_FEEDBACK_MESSAGES: Record<NonNullable<ShareFeedback>, string> = {
  shared: '🔗 Compartilhamento aberto',
  copied: '✅ Link copiado!',
  cancelled: 'Compartilhamento cancelado',
  failed: 'Não foi possível compartilhar',
}

export function StorefrontProductPage() {
  const { slug = '', productId = '' } = useParams()
  const navigate = useNavigate()

  const [store, setStore] = useState<Store | undefined>()
  const [product, setProduct] = useState<Product | undefined>()
  const [notFound, setNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [shareFeedback, setShareFeedback] = useState<ShareFeedback>(null)
  const [cartFeedback, setCartFeedback] = useState<CartFeedback>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const nextStore = await getPublicStorefront(slug)
      if (cancelled) return

      if (!nextStore) {
        setNotFound(true)
        return
      }

      setStore(nextStore)

      setPendingStoreInvite({
        slug: nextStore.slug,
        storeId: nextStore.id,
        storeName: nextStore.name,
        logoUrl: nextStore.logoUrl,
        capturedAt: new Date().toISOString(),
        source: 'invite_link',
      })

      const allProducts = await getProductsByStore(nextStore.id)
      if (cancelled) return

      const found = allProducts.find((p) => p.id === productId)
      if (!found) {
        setNotFound(true)
        return
      }

      setProduct(found)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug, productId])

  const storeTheme = getStoreTheme(store)

  const handleShare = useCallback(async () => {
    if (!store || !product) return
    const url = buildPublicUrl(`/loja/${store.slug}/produto/${product.id}`)
    const result = await shareOrCopy({
      title: product.name,
      text: `Olha esse produto da ${store.name}: ${product.name} —`,
      url,
    })
    setShareFeedback(result)
    setTimeout(() => setShareFeedback(null), 3000)
  }, [store, product])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setErrorMessage('')
      await addProductToCart(product)
      setCartFeedback('added')
    } catch (error) {
      console.error('Falha ao adicionar item no carrinho:', error)
      setErrorMessage('Não foi possível adicionar o produto ao carrinho. Tente novamente.')
    }
  }

  const handleWhatsApp = () => {
    if (!store || !product) return
    if (!store.whatsapp) {
      setErrorMessage('Esta loja ainda não configurou WhatsApp. Tente novamente mais tarde.')
      return
    }
    const message = encodeURIComponent(
      `Olá! Tenho interesse em ${product.name} que vi na loja ${store.name}.`,
    )
    window.open(`https://wa.me/${store.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  const handleExternalLink = () => {
    if (!product) return
    if (!product.externalUrl) {
      setErrorMessage('Este produto ainda não possui link externo disponível.')
      return
    }
    window.open(product.externalUrl, '_blank', 'noopener,noreferrer')
  }

  if (notFound) {
    return (
      <section className="stack-lg" style={{ padding: '2rem 0' }}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>📦</p>
          <h2 style={{ margin: '0 0 0.5rem' }}>Produto não encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem' }}>
            Este produto não está disponível no momento.
          </p>
          <Button type="button" variant="primary" onClick={() => navigate(`/loja/${slug}`)}>
            <Icon name="arrowRight" className="icon-sm" style={{ transform: 'rotate(180deg)' }} />
            Voltar para a loja
          </Button>
        </div>
      </section>
    )
  }

  if (!store || !product) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando…
      </div>
    )
  }

  const isPhysical = product.productType === 'physical'
  const isService = product.productType === 'service'
  const isExternal =
    product.productType === 'external_link' || product.productType === 'affiliate'

  return (
    <div
      className="store-vitrine"
      style={
        {
          '--store-primary': storeTheme.primaryColor,
          '--store-accent': storeTheme.accentColor,
          '--store-secondary': storeTheme.secondaryColor,
          '--store-btn-radius': storeTheme.buttonRadius,
          '--store-card-radius': storeTheme.borderRadius,
        } as React.CSSProperties
      }
    >
      {/* Top bar */}
      <div
        className="store-topbar"
        style={{ '--topbar-primary': storeTheme.primaryColor } as React.CSSProperties}
      >
        <button
          type="button"
          className="store-topbar-btn"
          onClick={() => navigate(`/loja/${slug}`)}
          aria-label="Voltar para a loja"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}
        >
          <Icon name="arrowRight" className="icon-sm" style={{ transform: 'rotate(180deg)' }} />
          <span style={{ display: 'none' }}>Voltar</span>
        </button>
        <div className="store-topbar-identity">
          {storeTheme.logoUrl && (
            <img src={storeTheme.logoUrl} alt={store.name} className="store-topbar-logo" />
          )}
          <span className="store-topbar-name">{store.name}</span>
        </div>
        <div className="store-topbar-actions">
          {isPhysical && (
            <button
              type="button"
              className="store-topbar-btn"
              onClick={() => navigate(`/loja/${slug}/carrinho`)}
              aria-label="Carrinho"
            >
              <Icon name="cart" className="icon-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Product detail content */}
      <div
        style={{
          maxWidth: '540px',
          margin: '0 auto',
          paddingBottom: '6rem',
        }}
      >
        {/* Product image */}
        <div
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--surface-alt)',
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {product.sponsoredLabel && (
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
              }}
            >
              <Badge variant="danger">Destaque</Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ padding: '1rem 1rem 0' }}>
          {/* Category + type badge */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {product.category && (
              <Badge variant="muted">{product.category}</Badge>
            )}
            <Badge variant="store" storeColor={storeTheme.primaryColor}>
              <Icon name="package" className="icon-sm" />
              {getProductBadgeLabel(product)}
            </Badge>
          </div>

          {/* Name */}
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          {/* Price */}
          <p
            style={{
              margin: '0 0 1rem',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: storeTheme.primaryColor,
            }}
          >
            {getProductPriceLabel(product)}
          </p>

          {/* External / affiliate notices */}
          {product.productType === 'external_link' && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                background: 'var(--color-surface-raised, #f9fafb)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              🔗 Você será direcionado para uma página externa.
            </div>
          )}
          {product.productType === 'affiliate' && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                background: 'var(--color-surface-raised, #f9fafb)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              🤝 Oferta de parceiro. A compra acontece fora da plataforma.
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          )}

          {product.affiliateDisclaimer && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {product.affiliateDisclaimer}
            </p>
          )}
          {product.sponsoredLabel && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {product.sponsoredLabel}
            </p>
          )}

          {/* Error */}
          {errorMessage && (
            <p style={{ margin: '0 0 0.75rem', color: 'var(--danger, #dc2626)', fontSize: '0.9rem' }}>
              {errorMessage}
            </p>
          )}

          {/* Cart feedback */}
          {cartFeedback === 'added' && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'var(--color-success-subtle, #f0fdf4)',
                border: '1px solid #86efac',
                marginBottom: '0.75rem',
              }}
            >
              <p style={{ margin: '0 0 0.6rem', fontWeight: 600, color: '#15803d', fontSize: '0.95rem' }}>
                ✅ Produto adicionado à sacola!
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="store"
                  size="sm"
                  storeColor={storeTheme.primaryColor}
                  onClick={() => navigate(`/loja/${slug}/carrinho`)}
                  style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                >
                  <Icon name="cart" className="icon-sm" />
                  Ver sacola
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCartFeedback(null)
                    navigate(`/loja/${slug}`)
                  }}
                  style={{ borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                >
                  Continuar comprando
                </Button>
              </div>
            </div>
          )}

          {/* Main action button */}
          {cartFeedback !== 'added' && (
            <div style={{ marginBottom: '0.75rem' }}>
              {isPhysical && (
                <Button
                  type="button"
                  variant="store"
                  size="lg"
                  storeColor={storeTheme.primaryColor}
                  onClick={handleAddToCart}
                  style={{ width: '100%', borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                >
                  <Icon name="cart" className="icon-sm" />
                  Adicionar à sacola
                </Button>
              )}
              {isService && (
                <Button
                  type="button"
                  variant="store"
                  size="lg"
                  storeColor={storeTheme.primaryColor}
                  onClick={handleWhatsApp}
                  style={{ width: '100%', borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                >
                  <Icon name="sparkles" className="icon-sm" />
                  Solicitar pelo WhatsApp
                </Button>
              )}
              {isExternal && (
                <Button
                  type="button"
                  variant="store"
                  size="lg"
                  storeColor={storeTheme.primaryColor}
                  onClick={handleExternalLink}
                  style={{ width: '100%', borderRadius: storeTheme.buttonRadius } as React.CSSProperties}
                >
                  <Icon name="arrowRight" className="icon-sm" />
                  {product.ctaLabel ?? 'Ver oferta'}
                </Button>
              )}
            </div>
          )}

          {/* Share button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleShare}
              style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' } as React.CSSProperties}
            >
              🔗 Compartilhar produto
            </Button>
            {shareFeedback && (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  color:
                    shareFeedback === 'failed'
                      ? 'var(--color-error, #dc2626)'
                      : 'var(--text-secondary)',
                }}
              >
                {SHARE_FEEDBACK_MESSAGES[shareFeedback]}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
