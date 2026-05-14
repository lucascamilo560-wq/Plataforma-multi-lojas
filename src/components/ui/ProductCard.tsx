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

export function ProductCard({ product, store, actionLabel, onAction }: ProductCardProps) {
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
      <p className="muted">{product.description}</p>
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
    </Card>
  )
}
