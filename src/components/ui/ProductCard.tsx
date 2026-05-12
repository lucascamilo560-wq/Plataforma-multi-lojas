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
  actionLabel = 'Adicionar',
  onAction,
}: ProductCardProps) {
  const theme = getStoreTheme(store)

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
          <Icon name="package" className="icon-sm" /> {product.stock} disponíveis
        </Badge>
        <strong className="price-text">{formatCurrency(product.price)}</strong>
      </div>
      {onAction && (
        <Button type="button" variant="store" size="lg" storeColor={theme.primaryColor} onClick={onAction}>
          <Icon name="cart" className="icon-sm" />
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}
