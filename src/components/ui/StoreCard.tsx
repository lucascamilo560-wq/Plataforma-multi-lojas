import { Link } from 'react-router-dom'
import type { Store } from '../../types'
import { getStoreTheme } from '../../styles/storeTheme'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { Icon } from './Icon'

interface StoreCardProps {
  store: Store
  ctaLabel?: string
}

export function StoreCard({ store, ctaLabel = 'Visitar loja' }: StoreCardProps) {
  const theme = getStoreTheme(store)

  return (
    <Card
      title={store.name}
      subtitle={`${store.category} · ${store.city}`}
      variant="accentCorner"
      accentColor={theme.accentColor}
      className="store-card"
    >
      <div className="store-media">
        <img src={theme.coverUrl} alt={`Capa da loja ${store.name}`} loading="lazy" />
      </div>
      <div className="store-identity">
        <img src={theme.logoUrl} alt={`Logo da loja ${store.name}`} className="store-logo" loading="lazy" />
        <div>
          <p className="muted">{store.description}</p>
          <p className="rating-line">
            <Icon name="star" className="icon-sm" /> {store.rating.toFixed(1)} de avaliação
          </p>
        </div>
      </div>
      <div className="inline-info">
        <Badge variant={store.isActive ? 'success' : 'muted'}>
          {store.isActive ? 'Entrega ativa' : 'Voltamos em breve'}
        </Badge>
        <Link to={`/stores/${store.id}`}>
          <Button variant="store" storeColor={theme.primaryColor}>
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
