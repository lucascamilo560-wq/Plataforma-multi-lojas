import type { Product, Store } from '../types'
import { formatCurrency } from './currency'
import { buildPublicUrl } from './publicUrl'
import type { ShareOptions } from './share'

/**
 * Monta o payload de compartilhamento de um produto.
 * Usado em StorefrontProductPage e nos cards da StorefrontPage.
 */
export function buildProductSharePayload(product: Product, store: Store): ShareOptions {
  const url = buildPublicUrl(`/loja/${store.slug}/produto/${product.id}`)

  const hasPrice = product.price > 0
  const priceLabel =
    hasPrice && product.productType !== 'service' ? ` por ${formatCurrency(product.price)}` : ''
  const priceServiceLabel =
    product.productType === 'service' && hasPrice ? ` por ${formatCurrency(product.price)}` : ''

  const priceText = priceLabel || priceServiceLabel

  const text = priceText
    ? `Olha esse produto na ${store.name}: ${product.name}${priceText}. Veja aqui:`
    : `Olha esse produto/serviço na ${store.name}: ${product.name}. Veja aqui:`

  return {
    title: `${product.name} — ${store.name}`,
    text,
    url,
    copyText: `${text} ${url}`,
  }
}
