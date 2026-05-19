import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import {
  clearCartByStore,
  getCartItemsByStore,
  getProductsByStore,
  getStoreBySlug,
  removeCartItem,
  updateCartItemQuantity,
} from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { CartItem, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StorefrontCartPage() {
  const { slug = '' } = useParams()
  const [store, setStore] = useState<Store | undefined>()
  const [items, setItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    getStoreBySlug(slug).then((nextStore) => {
      setStore(nextStore)
      if (nextStore) {
        void getCartItemsByStore(nextStore.id).then(setItems)
        void getProductsByStore(nextStore.id).then(setProducts)
      }
    })
  }, [slug])

  const productMap = useMemo(() => {
    const map = new Map<string, Product>()
    products.forEach((p) => map.set(p.id, p))
    return map
  }, [products])

  const total = useMemo(
    () => items.reduce((amount, item) => amount + item.price * item.quantity, 0),
    [items],
  )

  const totalQty = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
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
    setConfirmClear(false)
  }

  return (
    <section className="stack-xl container" style={{ paddingBottom: items.length > 0 ? '6rem' : undefined }}>
      <SectionHeader
        kicker="Sacola"
        icon="cart"
        title={store ? `Sacola — ${store.name}` : 'Sacola'}
        description="Revise seus itens antes de finalizar o pedido."
      />

      <div className="grid">
        <Card title="Itens da sacola" subtitle="Somente produtos desta loja" variant="accentCorner">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <span className="cart-empty-icon">
                <Icon name="cart" className="icon-xl" />
              </span>
              <p className="cart-empty-title">Sua sacola está vazia</p>
              <p className="cart-empty-sub">Escolha um produto da loja para continuar.</p>
              <div className="cart-empty-actions">
                <Link to={`/loja/${slug}`}>
                  <Button variant="store" size="md" storeColor={storeTheme.primaryColor}>Ver produtos</Button>
                </Link>
                <Link to={`/loja/${slug}`}>
                  <Button variant="secondary" size="md">Voltar para loja</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="stack">
              {items.map((item) => {
                const product = productMap.get(item.product_id)
                const imageUrl = product?.imageUrl
                return (
                  <article key={item.id} className="cart-line-item">
                    <div className="cart-line-thumb">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.productName} className="cart-line-img" />
                      ) : (
                        <span className="cart-line-icon">
                          <Icon name="package" className="icon-md" />
                        </span>
                      )}
                    </div>

                    <div className="cart-line-body">
                      <div className="cart-line-top">
                        <div>
                          <strong className="cart-line-name">{item.productName}</strong>
                          <p className="muted cart-line-store">{store?.name ?? 'Loja'}</p>
                          <p className="cart-line-unit-price">{formatCurrency(item.price)} cada</p>
                        </div>
                        <button
                          type="button"
                          className="cart-line-remove"
                          onClick={() => { void handleRemove(item.id) }}
                          aria-label="Remover item"
                        >
                          <Icon name="close" className="icon-sm" />
                        </button>
                      </div>

                      <div className="cart-line-bottom">
                        <div className="cart-qty-stepper" role="group" aria-label="Quantidade">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => { void handleUpdateQty(item.id, item.quantity - 1) }}
                            aria-label="Diminuir quantidade"
                          >
                            −
                          </button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => { void handleUpdateQty(item.id, item.quantity + 1) }}
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>
                        <strong className="cart-line-subtotal">{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                    </div>
                  </article>
                )
              })}

              <div className="cart-actions">
                <Link to={`/loja/${slug}`}>
                  <Button variant="secondary" size="md">Continuar comprando</Button>
                </Link>
                {confirmClear ? (
                  <div className="cart-clear-confirm">
                    <span>Remover todos os itens da sacola?</span>
                    <Button variant="ghost" size="sm" onClick={() => { void handleClearCart() }}>
                      Confirmar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="md" onClick={() => setConfirmClear(true)}>
                    Limpar sacola
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {items.length > 0 && (
          <Card title="Resumo do pedido" subtitle="Confira antes de confirmar" className="cart-summary" variant="layered">
            <div className="stack" style={{ gap: '0.6rem' }}>
              <div className="inline-info">
                <span className="muted">Itens</span>
                <strong>{totalQty} {totalQty === 1 ? 'item' : 'itens'}</strong>
              </div>
              <div className="inline-info">
                <span className="muted">Subtotal</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="inline-info">
                <span className="muted">Entrega</span>
                <span>Calculada no checkout</span>
              </div>
            </div>
            <footer className="card-footer">
              <div>
                <p className="cart-summary-total-label">Total estimado</p>
                <strong className="cart-summary-total-value">{formatCurrency(total)}</strong>
                <p className="cart-summary-note">Pagamento e entrega são definidos pela loja.</p>
              </div>
              <Link to={`/loja/${slug}/checkout`} style={{ width: '100%' }}>
                <Button variant="store" size="lg" storeColor={storeTheme.primaryColor} style={{ width: '100%' }}>
                  <Icon name="check" className="icon-sm" />
                  Finalizar pedido
                </Button>
              </Link>
            </footer>
          </Card>
        )}
      </div>

      {items.length > 0 && (
        <div className="cart-sticky-bar">
          <div className="cart-sticky-info">
            <span className="cart-sticky-qty">{totalQty} {totalQty === 1 ? 'item' : 'itens'}</span>
            <strong className="cart-sticky-total">{formatCurrency(total)}</strong>
          </div>
          <Link to={`/loja/${slug}/checkout`}>
            <Button variant="store" size="md" storeColor={storeTheme.primaryColor}>
              Finalizar pedido
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}

