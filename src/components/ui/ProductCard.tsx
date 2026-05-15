import { Button } from './Button'
import { Card } from './Card'
import type { Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { getStoreTheme } from '../../styles/storeTheme'
import { Badge } from './Badge'
import { Icon } from './Icon'

interface ProductCardProps {
  product: Product
  store?: Store
  actionLabel?: string
  onAction?: () => void
  onShare?: () => void
  shareFeedback?: 'shared' | 'copied' | 'cancelled' | 'failed' | null
}

function getExternalNotice(productType: Product['productType']) {
  switch (productType) {
    case 'external_link':
      return 'Você será direcionado para uma página externa.'
    case 'affiliate':
      return 'Oferta de parceiro. A compra acontece fora da plataforma.'
    default:
      return ''
  }
}

function getProductBadgeLabel(product: Product) {
  if (product.productType === 'physical') return `${product.stock} disponíveis`
  if (product.productType === 'service') return 'Serviço local'
  if (product.productType === 'external_link') return 'Link externo'
  return 'Afiliado'
}

function getProductPriceLabel(product: Product) {
  if (product.productType === 'service') return product.price > 0 ? formatCurrency(product.price) : 'Preço sob consulta'
  return formatCurrency(product.price)
}

const SHARE_FEEDBACK_LABELS: Record<NonNullable<ProductCardProps['shareFeedback']>, string> = {
  shared: '🔗 Compartilhamento aberto',
  copied: '✅ Link copiado!',
  cancelled: 'Cancelado',
  failed: 'Não foi possível compartilhar',
}

export function ProductCard({ product, store, actionLabel, onAction, onShare, shareFeedback }: ProductCardProps) {
  const theme = getStoreTheme(store)
  const actionButtonLabel = actionLabel ?? product.ctaLabel ?? 'Adicionar ao carrinho'
  const isPhysical = product.productType === 'physical'
  const hasExternalNotice = product.productType === 'external_link' || product.productType === 'affiliate'
  const externalNotice = getExternalNotice(product.productType)

  return (
    <Card
      title={product.name}
      subtitle={product.category}
      variant="accentCorner"
      accentColor={theme.accentColor}
      className={`product-card product-card--${theme.cardStyle} product-card--${theme.productLayout}`}
    >
      <div className="product-image-wrap">
        <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
        {product.sponsoredLabel && <Badge variant="danger">Destaque</Badge>}
      </div>
      <p className="muted product-desc">{product.description}</p>
      <div className="inline-info">
        <Badge variant="store" storeColor={theme.primaryColor}>
          <Icon name="package" className="icon-sm" />
          {getProductBadgeLabel(product)}
        </Badge>
        <strong className="price-text">{getProductPriceLabel(product)}</strong>
      </div>
      {product.sponsoredLabel && <p className="muted">{product.sponsoredLabel}</p>}
      {product.affiliateDisclaimer && <p className="muted">{product.affiliateDisclaimer}</p>}
      {hasExternalNotice && <p className="muted">{externalNotice}</p>}
      {onAction && (
        <Button type="button" variant="store" size="lg" storeColor={theme.primaryColor} onClick={onAction}>
          <Icon name={isPhysical ? 'cart' : 'arrowRight'} className="icon-sm" />
          {actionButtonLabel}
        </Button>
      )}
      {onShare && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <Button type="button" variant="ghost" size="sm" onClick={onShare} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            🔗 Compartilhar
          </Button>
          {shareFeedback && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: shareFeedback === 'failed' ? 'var(--color-error, #dc2626)' : 'var(--text-secondary)' }}>
              {SHARE_FEEDBACK_LABELS[shareFeedback]}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
