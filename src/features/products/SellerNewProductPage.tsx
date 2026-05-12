import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { useMockSession } from '../../hooks/useMockSession'
import { createProduct, getProductsByStore, updateProduct } from '../../services/mockData'
import type { Product } from '../../types'

interface ProductFormState {
  name: string
  description: string
  price: string
  stock: string
  category: string
  imageUrl: string
  isActive: 'active' | 'paused'
}

const initialFormState: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
  isActive: 'active',
}

function toFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    imageUrl: product.imageUrl,
    isActive: product.isActive ? 'active' : 'paused',
  }
}

export function SellerNewProductPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { storeId } = useMockSession()
  const [formState, setFormState] = useState<ProductFormState>(initialFormState)
  const [errorMessage, setErrorMessage] = useState('')

  const editingProductId = searchParams.get('editar')

  useEffect(() => {
    if (!editingProductId) {
      return
    }

    getProductsByStore(storeId, { includeInactive: true }).then((products) => {
      const product = products.find((item) => item.id === editingProductId)

      if (!product) {
        setErrorMessage('Produto não encontrado. Ele pode ter sido excluído ou o link está inválido.')
        return
      }

      setFormState(toFormState(product))
    })
  }, [editingProductId, storeId])

  const pageTitle = useMemo(
    () => (editingProductId ? 'Editar produto da loja' : 'Cadastrar novo produto'),
    [editingProductId],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const price = Number(formState.price)
    const stock = Number(formState.stock)

    if (!Number.isFinite(price) || price < 0) {
      setErrorMessage('Informe um preço válido (0 ou maior).')
      return
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setErrorMessage('Informe um estoque válido (0 ou maior).')
      return
    }

    if (!formState.imageUrl.trim()) {
      setErrorMessage('Informe a URL da imagem do produto.')
      return
    }

    const updatePayload = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      price,
      stock,
      category: formState.category.trim(),
      imageUrl: formState.imageUrl.trim(),
      isActive: formState.isActive === 'active',
    }

    if (editingProductId) {
      await updateProduct(editingProductId, updatePayload)
    } else {
      await createProduct({ ...updatePayload, store_id: storeId })
    }

    navigate('/lojista/produtos')
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker={editingProductId ? 'Editar produto' : 'Novo produto'}
        icon="package"
        title={pageTitle}
        description="Preencha os dados do produto para atualizar automaticamente a vitrine pública da sua loja."
      />

      <Card title="Dados do produto" subtitle="Cadastro real com persistência local" variant="layered">
        <form className="stack" onSubmit={handleSubmit}>
          <Input
            id="product-name"
            label="Nome do produto"
            value={formState.name}
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            required
          />

          <label className="field" htmlFor="product-description">
            <span className="field-label">Descrição</span>
            <textarea
              id="product-description"
              className="input"
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              required
            />
          </label>

          <div className="grid grid-3">
            <Input
              id="product-price"
              label="Preço"
              type="number"
              min={0}
              step="0.01"
              value={formState.price}
              onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))}
              required
            />
            <Input
              id="product-stock"
              label="Estoque"
              type="number"
              min={0}
              value={formState.stock}
              onChange={(event) => setFormState((current) => ({ ...current, stock: event.target.value }))}
              required
            />
            <Input
              id="product-category"
              label="Categoria"
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
              required
            />
          </div>

          <Input
            id="product-image-url"
            label="Imagem (URL)"
            value={formState.imageUrl}
            onChange={(event) => setFormState((current) => ({ ...current, imageUrl: event.target.value }))}
            required
          />

          <Select
            id="product-status"
            label="Status"
            value={formState.isActive}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                isActive: event.target.value as ProductFormState['isActive'],
              }))
            }
          >
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
          </Select>

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <div className="inline-info">
            <Button type="button" variant="ghost" onClick={() => navigate('/lojista/produtos')}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              {editingProductId ? 'Salvar alterações' : 'Cadastrar produto'}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
