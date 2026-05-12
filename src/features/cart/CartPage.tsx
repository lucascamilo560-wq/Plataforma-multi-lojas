import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getCartItems, getStoreById } from '../../services/mockData'
import type { CartItem } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    getCartItems().then(setItems)
  }, [])

  const total = useMemo(
    () => items.reduce((amount, item) => amount + item.price * item.quantity, 0),
    [items],
  )

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Carrinho"
        icon="cart"
        title="Seu pedido está quase pronto"
        description="Revise seus itens, confira o total e avance para finalizar sua compra com segurança."
      />

      <div className="grid">
        <Card title="Itens do carrinho" subtitle="Seleção atual da sua compra" variant="accentCorner">
          {items.length === 0 ? (
            <p className="empty-state">Seu carrinho está vazio.</p>
          ) : (
            <div className="stack">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </Card>

        <Card title="Resumo da compra" subtitle="Confira o valor final" className="cart-summary" variant="layered">
          <div className="stack" style={{ gap: '0.6rem' }}>
            <div className="inline-info">
              <span className="muted">Subtotal</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div className="inline-info">
              <span className="muted">Entrega</span>
              <strong>Calculada na próxima etapa</strong>
            </div>
          </div>
          <footer className="card-footer">
            <strong>Total estimado: {formatCurrency(total)}</strong>
            <Link to="/cliente/checkout">
              <Button variant="accent" size="lg">
                <Icon name="check" className="icon-sm" />
                Finalizar pedido
              </Button>
            </Link>
          </footer>
        </Card>
      </div>
    </section>
  )
}

function CartLineItem({ item }: { item: CartItem }) {
  const [storeName, setStoreName] = useState('Loja parceira')

  useEffect(() => {
    getStoreById(item.store_id).then((store) => setStoreName(store?.name ?? 'Loja parceira'))
  }, [item.store_id])

  return (
    <article className="cart-line-item">
      <span className="cart-line-icon">
        <Icon name="package" className="icon-md" />
      </span>
      <div style={{ flex: 1 }}>
        <strong>{item.productName}</strong>
        <p className="muted">{storeName}</p>
      </div>
      <div className="text-right">
        <p className="muted">Qtd: {item.quantity}</p>
        <strong>{formatCurrency(item.price * item.quantity)}</strong>
      </div>
    </article>
  )
}
