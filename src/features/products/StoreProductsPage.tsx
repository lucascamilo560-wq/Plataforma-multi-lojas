import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import {
  deleteProduct,
  getProductsByStore,
  getStoreById,
  toggleProductActive,
  updateProductStock,
} from '../../services/mockData'
import type { Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StoreProductsPage() {
  const { storeId } = useMockSession()
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [errorMessage, setErrorMessage] = useState('')
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({})

  const refreshProducts = useCallback(() => {
    getProductsByStore(storeId, { includeInactive: true }).then((nextProducts) => {
      setProducts(nextProducts)
      setStockInputs(
        nextProducts.reduce<Record<string, string>>((acc, product) => {
          acc[product.id] = String(product.stock)
          return acc
        }, {}),
      )
    })
  }, [storeId])

  useEffect(() => {
    refreshProducts()
    getStoreById(storeId).then(setStore)
  }, [refreshProducts, storeId])

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)),
    [products],
  )

  const handleDelete = async (product: Product) => {
    const shouldDelete = window.confirm(`Deseja excluir o produto "${product.name}"?`)

    if (!shouldDelete) {
      return
    }

    setErrorMessage('')
    await deleteProduct(product.id)
    refreshProducts()
  }

  const handleToggleActive = async (productId: string) => {
    setErrorMessage('')
    await toggleProductActive(productId)
    refreshProducts()
  }

  const handleUpdateStock = async (productId: string) => {
    const nextStock = Number(stockInputs[productId])

    if (!Number.isFinite(nextStock) || nextStock < 0) {
      setErrorMessage('Informe um estoque válido (0 ou maior).')
      return
    }

    setErrorMessage('')
    await updateProductStock(productId, nextStock)
    refreshProducts()
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Produtos"
        icon="package"
        title="Produtos da sua loja"
        description={`Gerencie o catálogo de ${store?.name ?? 'sua loja'} com cadastro, edição, estoque e status de publicação.`}
      />

      <div className="inline-info">
        <Link to="/lojista/produtos/novo">
          <Button variant="accent">Cadastrar produto</Button>
        </Link>
        <Badge variant="muted">{products.length} produto(s)</Badge>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="grid">
        {sortedProducts.map((product) => (
          <Card key={product.id} title={product.name} subtitle={product.category} variant="accentCorner">
            <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
            <p className="muted">{product.description}</p>
            <div className="inline-info">
              <strong>{formatCurrency(product.price)}</strong>
              <Badge variant={product.isActive ? 'success' : 'danger'}>
                {product.isActive ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>

            <div className="field">
              <span className="field-label">Estoque</span>
              <div className="inline-info">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={stockInputs[product.id] ?? ''}
                  onChange={(event) =>
                    setStockInputs((current) => ({
                      ...current,
                      [product.id]: event.target.value,
                    }))
                  }
                />
                <Button type="button" variant="secondary" onClick={() => handleUpdateStock(product.id)}>
                  Salvar estoque
                </Button>
              </div>
            </div>

            <div className="inline-info">
              <Link to={`/lojista/produtos/novo?editar=${product.id}`}>
                <Button type="button" variant="ghost">
                  Editar
                </Button>
              </Link>
              <Button type="button" variant="secondary" onClick={() => handleToggleActive(product.id)}>
                {product.isActive ? 'Pausar' : 'Ativar'}
              </Button>
              <Button type="button" variant="danger" onClick={() => handleDelete(product)}>
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
