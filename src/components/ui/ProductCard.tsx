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

export function ProductCard({
  product,
  store,
  actionLabel,
  onAction,
}: ProductCardProps) {
  const theme = getStoreTheme(store)
  const actionButtonLabel = actionLabel ?? product.ctaLabel ?? 'Adicionar ao carrinho'
  const isPhysical = product.productType === 'physical'
  const hasExternalNotice = product.productType === 'external_link' || product.productType === 'affiliate'
  const externalNotice =
    product.productType === 'external_link'
      ? 'Você será direcionado para uma página externa.'
      : product.productType === 'affiliate'
        ? 'Oferta de parceiro. A compra acontece fora da plataforma.'
        : ''
  const servicePriceLabel = product.price > 0 ? formatCurrency(product.price) : 'Preço sob consulta'

  return (
    <Card
      title={product.name}
      subtitle={product.category}
      variant="accentCorner"
      accentColor={theme.accentColor}
      className="product-card"
    >
      <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
      <p className="muted">{product.description}</p>
      <div className="inline-info">
        <Badge variant="store" storeColor={theme.primaryColor}>
          <Icon name="package" className="icon-sm" />
          {isPhysical ? `${product.stock} disponíveis` : product.productType === 'service' ? 'Serviço local' : 'Oferta externa'}
        </Badge>
        <strong className="price-text">{product.productType === 'service' ? servicePriceLabel : formatCurrency(product.price)}</strong>
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
