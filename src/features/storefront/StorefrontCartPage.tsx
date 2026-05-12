import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getCartItemsByStore, getStoreBySlug } from '../../services/mockData'
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
                <Button variant="secondary">Voltar para a loja</Button>
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
                  <div className="text-right">
                    <p className="muted">Qtd: {item.quantity}</p>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                </article>
              ))}
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
