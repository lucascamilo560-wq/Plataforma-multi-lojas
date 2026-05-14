import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs } from '../../components/ui/Tabs'
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

const LOW_STOCK_THRESHOLD = 5

type FilterKey = 'all' | 'active' | 'paused' | 'physical' | 'service' | 'external_link' | 'affiliate' | 'low_stock'

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'paused', label: 'Pausados' },
  { key: 'physical', label: 'Produto físico' },
  { key: 'service', label: 'Serviço' },
  { key: 'external_link', label: 'Por link' },
  { key: 'affiliate', label: 'Afiliado' },
  { key: 'low_stock', label: '⚠️ Estoque baixo' },
] satisfies { key: FilterKey; label: string }[]

function getProductTypeLabel(productType: Product['productType']) {
  switch (productType) {
    case 'service':
      return 'Serviço local'
    case 'external_link':
      return 'Produto por link'
    case 'affiliate':
      return 'Oferta afiliada'
    case 'physical':
    default:
      return 'Produto físico'
  }
}

function getProductTypeBadgeVariant(productType: Product['productType']): 'muted' | 'accent' {
  if (productType === 'affiliate' || productType === 'external_link') return 'accent'
  return 'muted'
}

function compareProducts(a: Product, b: Product) {
  if (a.isActive !== b.isActive) {
    return a.isActive ? -1 : 1
  }
  return a.name.localeCompare(b.name)
}

function applyFilter(products: Product[], filter: FilterKey): Product[] {
  switch (filter) {
    case 'active':
      return products.filter((p) => p.isActive)
    case 'paused':
      return products.filter((p) => !p.isActive)
    case 'physical':
      return products.filter((p) => p.productType === 'physical')
    case 'service':
      return products.filter((p) => p.productType === 'service')
    case 'external_link':
      return products.filter((p) => p.productType === 'external_link')
    case 'affiliate':
      return products.filter((p) => p.productType === 'affiliate')
    case 'low_stock':
      return products.filter((p) => p.productType === 'physical' && p.stock <= LOW_STOCK_THRESHOLD)
    default:
      return products
  }
}

function applySearch(products: Product[], query: string): Product[] {
  const q = query.toLowerCase().trim()
  if (!q) return products
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  )
}

export function StoreProductsPage() {
  const { storeId } = useMockSession()
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()
  const [errorMessage, setErrorMessage] = useState('')
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({})
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

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

  const visibleProducts = useMemo(() => {
    const sorted = [...products].sort(compareProducts)
    const filtered = applyFilter(sorted, activeFilter)
    return applySearch(filtered, searchQuery)
  }, [products, activeFilter, searchQuery])

  const lowStockCount = useMemo(
    () => products.filter((p) => p.productType === 'physical' && p.stock <= LOW_STOCK_THRESHOLD).length,
    [products],
  )

  const handleDelete = async (product: Product) => {
    if (pendingDeleteProductId !== product.id) {
      setPendingDeleteProductId(product.id)
      return
    }

    setErrorMessage('')
    await deleteProduct(product.id)
    setPendingDeleteProductId(null)
    refreshProducts()
  }

  const handleToggleActive = async (productId: string) => {
    setErrorMessage('')
    await toggleProductActive(productId)
    refreshProducts()
  }

  const handleUpdateStock = async (productId: string) => {
    const product = products.find((item) => item.id === productId)
    if (product && product.productType !== 'physical') {
      setErrorMessage('Ajuste de estoque é usado apenas para produtos físicos.')
      return
    }

    const nextStock = Number(stockInputs[productId])

    if (!Number.isFinite(nextStock) || nextStock < 0) {
      setErrorMessage('Informe um estoque válido (0 ou maior).')
      return
    }

    setErrorMessage('')
    await updateProductStock(productId, nextStock)
    refreshProducts()
  }

  const storeSlug = store?.slug

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
        <div className="inline-info" style={{ gap: '0.45rem' }}>
          <Badge variant="muted">{products.length} produto(s)</Badge>
          {lowStockCount > 0 && (
            <Badge variant="danger">{lowStockCount} estoque baixo</Badge>
          )}
        </div>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {products.length === 0 ? (
        <div className="products-empty-state">
          <div className="products-empty-icon" aria-hidden="true">📦</div>
          <h3 className="products-empty-title">Nenhum produto cadastrado ainda</h3>
          <p className="products-empty-desc">
            Produtos físicos aparecem na vitrine e podem gerar pedido diretamente pela plataforma.
            Cadastre seu primeiro produto agora.
          </p>
          <div className="inline-info" style={{ justifyContent: 'center' }}>
            <Link to="/lojista/produtos/novo">
              <Button variant="accent">Cadastrar primeiro produto</Button>
            </Link>
            {storeSlug && (
              <Link to={`/loja/${storeSlug}`}>
                <Button variant="ghost">Ver minha vitrine</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="field">
            <Input
              id="products-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, categoria ou descrição…"
            />
          </div>

          {/* Filter tabs */}
          <Tabs
            items={FILTER_TABS}
            activeKey={activeFilter}
            onChange={(key) => setActiveFilter(key as FilterKey)}
          />

          {visibleProducts.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum produto encontrado para este filtro.</p>
            </div>
          ) : (
            <div className="grid">
              {visibleProducts.map((product) => (
                <Card key={product.id} title={product.name} subtitle={product.category} variant="accentCorner">
                  <div className="product-list-img-wrap">
                    <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
                  </div>

                  <div className="inline-info">
                    <Badge variant={getProductTypeBadgeVariant(product.productType)}>
                      {getProductTypeLabel(product.productType)}
                    </Badge>
                    <Badge variant={product.isActive ? 'success' : 'danger'}>
                      {product.isActive ? 'Ativo' : 'Pausado'}
                    </Badge>
                  </div>

                  <div className="inline-info">
                    <strong className="price-text">
                      {product.productType === 'service' && product.price === 0
                        ? 'Preço sob consulta'
                        : formatCurrency(product.price)}
                    </strong>
                    {product.productType === 'physical' && (
                      <span className={`product-stock-badge ${product.stock <= LOW_STOCK_THRESHOLD ? 'product-stock-badge--low' : ''}`}>
                        {product.stock} em estoque
                      </span>
                    )}
                  </div>

                  {product.externalUrl && (
                    <p className="muted product-external-url" title={product.externalUrl}>
                      🔗 {product.externalUrl}
                    </p>
                  )}

                  {product.productType === 'physical' && (
                    <div className="field">
                      <span className="field-label">Ajustar estoque</span>
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
                          Salvar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Link to={`/lojista/produtos/novo?editar=${product.id}`}>
                      <Button type="button" variant="ghost" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button type="button" variant="secondary" size="sm" onClick={() => handleToggleActive(product.id)}>
                      {product.isActive ? 'Pausar' : 'Ativar'}
                    </Button>
                    {storeSlug && (
                      <Link to={`/loja/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="ghost" size="sm">
                          Ver na vitrine
                        </Button>
                      </Link>
                    )}
                    <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(product)}>
                      {pendingDeleteProductId === product.id ? 'Confirmar exclusão' : 'Excluir'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
