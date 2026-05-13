import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import {
  clearCartByStore,
  getCartItemsByStore,
  getStoreBySlug,
  removeCartItem,
  updateCartItemQuantity,
} from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { CartItem, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StorefrontCartPage() {
  const { slug = '' } = useParams()
  const [store, setStore] = useState<Store | undefined>()
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    getStoreBySlug(slug).then((nextStore) => {
      setStore(nextStore)
      if (nextStore) {
        getCartItemsByStore(nextStore.id).then(setItems)
      }
    })
  }, [slug])

  const total = useMemo(
    () => items.reduce((amount, item) => amount + item.price * item.quantity, 0),
    [items],
  )

  const storeTheme = getStoreTheme(store)

  const handleUpdateQty = async (itemId: string, quantity: number) => {
    await updateCartItemQuantity(itemId, quantity)
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== itemId)
        : prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    )
  }

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleClearCart = async () => {
    if (!store) return
    await clearCartByStore(store.id)
    setItems([])
  }

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Carrinho"
        icon="cart"
        title={store ? `Carrinho — ${store.name}` : 'Carrinho'}
        description="Revise seus itens antes de finalizar o pedido."
      />

      <div className="grid">
        <Card title="Itens selecionados" subtitle="Somente produtos desta loja" variant="accentCorner">
          {items.length === 0 ? (
            <div className="stack">
              <p className="empty-state">Seu carrinho está vazio.</p>
              <Link to={`/loja/${slug}`}>
                <Button variant="secondary">Continuar comprando</Button>
              </Link>
            </div>
          ) : (
            <div className="stack">
              {items.map((item) => (
                <article key={item.id} className="cart-line-item">
                  <span className="cart-line-icon">
                    <Icon name="package" className="icon-md" />
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>{item.productName}</strong>
                    <p className="muted">{store?.name ?? 'Loja'}</p>
                  </div>
                  <div className="inline-info" style={{ gap: '0.25rem', alignItems: 'center' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { void handleUpdateQty(item.id, item.quantity - 1) }}
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </Button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { void handleUpdateQty(item.id, item.quantity + 1) }}
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-right">
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { void handleRemove(item.id) }}
                    aria-label="Remover item"
                  >
                    <Icon name="close" className="icon-sm" />
                  </Button>
                </article>
              ))}
              <div className="inline-info" style={{ marginTop: '0.5rem' }}>
                <Link to={`/loja/${slug}`}>
                  <Button variant="secondary" size="md">Continuar comprando</Button>
                </Link>
                <Button variant="ghost" size="md" onClick={() => { void handleClearCart() }}>
                  Limpar carrinho
                </Button>
              </div>
            </div>
          )}
        </Card>

        {items.length > 0 && (
          <Card title="Resumo" subtitle="Confira antes de confirmar" className="cart-summary" variant="layered">
            <div className="stack" style={{ gap: '0.6rem' }}>
              <div className="inline-info">
                <span className="muted">Subtotal</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="inline-info">
                <span className="muted">Entrega</span>
                <strong>Calculada no checkout</strong>
              </div>
            </div>
            <footer className="card-footer">
              <strong>Total estimado: {formatCurrency(total)}</strong>
              <Link to={`/loja/${slug}/checkout`}>
                <Button variant="store" size="lg" storeColor={storeTheme.primaryColor}>
                  <Icon name="check" className="icon-sm" />
                  Finalizar pedido
                </Button>
              </Link>
            </footer>
          </Card>
        )}
      </div>
    </section>
  )
}

