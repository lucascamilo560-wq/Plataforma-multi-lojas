import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getCartItems } from '../../services/mockData'
import { formatCurrency } from '../../utils/currency'
import { useEffect, useMemo, useState } from 'react'
import type { CartItem } from '../../types'

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
    <section className="stack-lg">
      <PageHeader
        title="Carrinho"
        description="Resumo inicial de itens por loja com base preparada para cálculo de frete e cupom."
      />
      <Card title="Itens selecionados">
        <ul className="list">
          {items.map((item) => (
            <li key={item.id} className="list-item">
              <div>
                <strong>{item.productName}</strong>
                <p className="muted">Loja: {item.store_id}</p>
              </div>
              <div className="text-right">
                <p>Qtd: {item.quantity}</p>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            </li>
          ))}
        </ul>
        <footer className="card-footer">
          <strong>Total: {formatCurrency(total)}</strong>
          <Link className="btn btn-primary" to="/checkout">
            Ir para checkout
          </Link>
        </footer>
      </Card>
    </section>
  )
}
