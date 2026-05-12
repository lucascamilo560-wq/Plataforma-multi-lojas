import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getCartItems } from '../../services/mockData'
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
        title="Resumo do pedido"
        description="Confira os itens selecionados por loja e siga para o checkout mockado da plataforma."
      />
      <Card title="Itens selecionados" variant="accentCorner">
        {items.length === 0 ? (
          <p className="empty-state">Seu carrinho está vazio.</p>
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li key={item.id} className="list-item">
                <div>
                  <strong>{item.productName}</strong>
                  <p className="muted">Loja: {item.store_id}</p>
                </div>
                <div className="text-right">
                  <p className="muted">Qtd: {item.quantity}</p>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
        <footer className="card-footer">
          <strong>Total: {formatCurrency(total)}</strong>
          <Link to="/checkout">
            <Button variant="primary">Ir para checkout</Button>
          </Link>
        </footer>
      </Card>
    </section>
  )
}
