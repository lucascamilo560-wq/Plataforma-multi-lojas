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
  productType: Product['productType']
  externalUrl: string
  ctaLabel: string
  sponsoredLabel: string
  affiliateDisclaimer: string
  isActive: 'active' | 'paused'
}

const initialFormState: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
  productType: 'physical',
  externalUrl: '',
  ctaLabel: '',
  sponsoredLabel: '',
  affiliateDisclaimer: '',
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
    productType: product.productType,
    externalUrl: product.externalUrl ?? '',
    ctaLabel: product.ctaLabel ?? '',
    sponsoredLabel: product.sponsoredLabel ?? '',
    affiliateDisclaimer: product.affiliateDisclaimer ?? '',
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

    const isPhysical = formState.productType === 'physical'
    const isService = formState.productType === 'service'
    const requiresExternalUrl = formState.productType === 'external_link' || formState.productType === 'affiliate'

    const parsedPrice = formState.price.trim() ? Number(formState.price) : 0
    const parsedStock = formState.stock.trim() ? Number(formState.stock) : 0

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Informe um preço válido (0 ou maior).')
      return
    }

    if (isPhysical && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
      setErrorMessage('Informe um estoque válido (0 ou maior).')
      return
    }

    if (isPhysical && !formState.stock.trim()) {
      setErrorMessage('Informe o estoque do produto físico.')
      return
    }

    if (!isService && !formState.price.trim()) {
      setErrorMessage('Informe um preço válido para continuar.')
      return
    }

    if (!formState.imageUrl.trim()) {
      setErrorMessage('Informe a URL da imagem do produto.')
      return
    }

    if (requiresExternalUrl && !formState.externalUrl.trim()) {
      setErrorMessage('Produtos por link ou afiliado precisam de URL externa.')
      return
    }

    const updatePayload = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      price: parsedPrice,
      stock: isPhysical ? parsedStock : 0,
      category: formState.category.trim(),
      imageUrl: formState.imageUrl.trim(),
      productType: formState.productType,
      externalUrl: formState.externalUrl.trim() || undefined,
      ctaLabel: formState.ctaLabel.trim() || undefined,
      sponsoredLabel: formState.sponsoredLabel.trim() || undefined,
      affiliateDisclaimer: formState.affiliateDisclaimer.trim() || undefined,
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

          <Select
            id="product-type"
            label="Tipo de produto"
            value={formState.productType}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                productType: event.target.value as Product['productType'],
              }))
            }
          >
            <option value="physical">Produto físico</option>
            <option value="service">Serviço local</option>
            <option value="external_link">Produto por link</option>
            <option value="affiliate">Oferta externa / afiliado</option>
          </Select>

          <div className="grid grid-3">
            <Input
              id="product-price"
              label={formState.productType === 'service' ? 'Preço (opcional)' : 'Preço'}
              type="number"
              min={0}
              step="0.01"
              value={formState.price}
              onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))}
              required={formState.productType !== 'service'}
            />
            <Input
              id="product-stock"
              label="Estoque"
              type="number"
              min={0}
              value={formState.stock}
              onChange={(event) => setFormState((current) => ({ ...current, stock: event.target.value }))}
              required={formState.productType === 'physical'}
              disabled={formState.productType !== 'physical'}
            />
            <Input
              id="product-category"
              label="Categoria"
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
              required
            />
          </div>

          {(formState.productType === 'external_link' || formState.productType === 'affiliate') && (
            <Input
              id="product-external-url"
              label="URL externa"
              value={formState.externalUrl}
              onChange={(event) => setFormState((current) => ({ ...current, externalUrl: event.target.value }))}
              required
            />
          )}

          {(formState.productType === 'service' ||
            formState.productType === 'external_link' ||
            formState.productType === 'affiliate') && (
            <Input
              id="product-cta-label"
              label="Texto do botão (opcional)"
              value={formState.ctaLabel}
              onChange={(event) => setFormState((current) => ({ ...current, ctaLabel: event.target.value }))}
              placeholder="Ex: Falar com a loja / Ver oferta"
            />
          )}

          {(formState.productType === 'external_link' || formState.productType === 'affiliate') && (
            <Input
              id="product-sponsored-label"
              label="Aviso curto (opcional)"
              value={formState.sponsoredLabel}
              onChange={(event) => setFormState((current) => ({ ...current, sponsoredLabel: event.target.value }))}
              placeholder="Ex: Conteúdo patrocinado"
            />
          )}

          {formState.productType === 'affiliate' && (
            <Input
              id="product-affiliate-disclaimer"
              label="Aviso de afiliado (opcional)"
              value={formState.affiliateDisclaimer}
              onChange={(event) =>
                setFormState((current) => ({ ...current, affiliateDisclaimer: event.target.value }))
              }
              placeholder="Ex: Compra fora da plataforma"
            />
          )}

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
