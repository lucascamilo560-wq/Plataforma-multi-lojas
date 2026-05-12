import { Button } from './Button'
import { Card } from './Card'
import type { Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { getStoreTheme } from '../../styles/storeTheme'

interface ProductCardProps {
  product: Product
  store?: Store
  actionLabel?: string
  onAction?: () => void
}

export function ProductCard({
  product,
  store,
  actionLabel = 'Adicionar ao carrinho',
  onAction,
}: ProductCardProps) {
  const theme = getStoreTheme(store)

  return (
    <Card
      title={product.name}
      subtitle={`${product.category} · Estoque ${product.stock}`}
      variant="accentCorner"
      accentColor={theme.accentColor}
    >
      <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
      <p className="muted">{product.description}</p>
      <div className="inline-info">
        <strong>{formatCurrency(product.price)}</strong>
        {onAction && (
          <Button type="button" variant="store" storeColor={theme.primaryColor} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  )
}
