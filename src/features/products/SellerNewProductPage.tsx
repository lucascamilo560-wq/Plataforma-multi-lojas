import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { useMockSession } from '../../hooks/useMockSession'
import { createProduct, getProductsByStore, updateProduct } from '../../services/mockData'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

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

const CATEGORY_SUGGESTIONS = [
  'Moda', 'Beleza', 'Acessórios', 'Mercado', 'Alimentos',
  'Serviços', 'Digital', 'Casa', 'Infantil', 'Outros',
]

const CTA_SUGGESTIONS: Record<Product['productType'], string[]> = {
  physical: ['Adicionar ao carrinho'],
  service: ['Solicitar orçamento', 'Falar com a loja', 'Agendar serviço'],
  external_link: ['Ver oferta', 'Abrir link', 'Comprar no site'],
  affiliate: ['Ver oferta externa', 'Conferir produto', 'Comprar com parceiro'],
}

const TYPE_HINTS: Record<Product['productType'], { icon: string; text: string; color: string }> = {
  physical: {
    icon: '🛍️',
    text: 'Vai para o carrinho e pode gerar pedido dentro da loja. Exige preço, estoque e imagem.',
    color: '#e0fce7',
  },
  service: {
    icon: '🔧',
    text: 'Cliente entra em contato ou solicita pelo botão. Preço e estoque são opcionais.',
    color: '#e0e7ff',
  },
  external_link: {
    icon: '🔗',
    text: 'Cliente será direcionado para fora da plataforma. Exige URL externa. Não entra no carrinho.',
    color: '#fef9c3',
  },
  affiliate: {
    icon: '📣',
    text: 'Use para indicar produto ou parceiro externo com aviso claro. Exige URL externa. Não entra no carrinho.',
    color: '#fee2e2',
  },
}

function getPreviewCtaLabel(form: ProductFormState): string {
  if (form.ctaLabel) return form.ctaLabel
  const suggestions = CTA_SUGGESTIONS[form.productType]
  return suggestions[0]
}

function getPreviewPriceLabel(form: ProductFormState): string {
  if (form.productType === 'service') {
    const p = Number(form.price)
    return p > 0 ? formatCurrency(p) : 'Preço sob consulta'
  }
  const p = Number(form.price)
  return p > 0 ? formatCurrency(p) : 'R$ —'
}

function getPreviewBadge(form: ProductFormState): string {
  if (form.productType === 'physical') {
    const s = Number(form.stock)
    return s > 0 ? `${s} disponíveis` : 'Estoque não definido'
  }
  if (form.productType === 'service') return 'Serviço local'
  if (form.productType === 'external_link') return 'Link externo'
  return 'Afiliado'
}

function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  // Only allow http/https URLs and relative paths; reject javascript: and data: protocols
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')
}

function ProductPreview({ form }: { form: ProductFormState }) {
  const [failedImageUrl, setFailedImageUrl] = useState('')

  const safeUrl = isSafeImageUrl(form.imageUrl) ? form.imageUrl : ''
  const imageHasFailed = failedImageUrl === safeUrl && safeUrl !== ''
  const showImg = safeUrl && !imageHasFailed

  return (
    <div className="product-preview-wrap">
      <p className="product-preview-label">Como aparecerá na vitrine</p>
      <div className="card card-accent-corner product-preview-card">
        <div className="product-preview-img-wrap">
          {showImg ? (
            <img
              src={safeUrl}
              alt="Prévia do produto"
              className="product-preview-img"
              onError={() => setFailedImageUrl(safeUrl)}
            />
          ) : (
            <div className="product-preview-placeholder">
              <span aria-hidden="true">🖼️</span>
              <span>{imageHasFailed ? 'Imagem inválida' : 'Imagem do produto'}</span>
            </div>
          )}
        </div>
        <div className="card-head">
          <h3 className="card-title">{form.name || 'Nome do produto'}</h3>
          <p className="card-subtitle">{form.category || 'Categoria'}</p>
        </div>
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          {form.description || 'Descrição do produto aparecerá aqui.'}
        </p>
        <div className="inline-info">
          <Badge variant="muted">{getPreviewBadge(form)}</Badge>
          <strong className="price-text">{getPreviewPriceLabel(form)}</strong>
        </div>
        {form.affiliateDisclaimer && (
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            {form.affiliateDisclaimer}
          </p>
        )}
        <button type="button" className="btn btn-accent btn-lg" style={{ width: '100%' }}>
          {getPreviewCtaLabel(form)}
        </button>
      </div>
    </div>
  )
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

  const isPhysical = formState.productType === 'physical'
  const isService = formState.productType === 'service'
  const requiresExternalUrl = formState.productType === 'external_link' || formState.productType === 'affiliate'
  const showCta = formState.productType !== 'physical'
  const hint = TYPE_HINTS[formState.productType]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const parsedPrice = formState.price.trim() ? Number(formState.price) : 0
    const parsedStock = formState.stock.trim() ? Number(formState.stock) : 0

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Informe um preço válido (0 ou maior).')
      return
    }

    if (isPhysical && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
      setErrorMessage('Informe um estoque válido para o produto físico (0 ou maior).')
      return
    }

    if (isPhysical && !formState.stock.trim()) {
      setErrorMessage('Estoque é obrigatório para produto físico.')
      return
    }

    if (!isService && !formState.price.trim()) {
      setErrorMessage('Preço é obrigatório para este tipo de produto.')
      return
    }

    if (!formState.imageUrl.trim()) {
      setErrorMessage('URL da imagem é obrigatória para publicar o produto.')
      return
    }

    if (requiresExternalUrl && !formState.externalUrl.trim()) {
      setErrorMessage('Produtos por link ou afiliado precisam de uma URL externa válida.')
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
        description="Preencha os dados abaixo. A prévia ao lado atualiza em tempo real conforme você digita."
      />

      <form className="stack-lg" onSubmit={handleSubmit}>
        <div className="new-product-layout">
          {/* ── Form column ── */}
          <div className="stack-lg">

            {/* Seção 1: Tipo */}
            <Card title="Tipo de item" variant="layered">
              <Select
                id="product-type"
                label="Selecione o tipo"
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

              <div className="type-hint-banner" style={{ background: hint.color }}>
                <span className="type-hint-icon" aria-hidden="true">{hint.icon}</span>
                <p className="type-hint-text">{hint.text}</p>
              </div>
            </Card>

            {/* Seção 2: Informações principais */}
            <Card title="Informações principais" variant="layered">
              <Input
                id="product-name"
                label="Nome do produto"
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex: Camiseta Estampada"
                required
              />

              <label className="field" htmlFor="product-description">
                <span className="field-label">Descrição</span>
                <textarea
                  id="product-description"
                  className="input"
                  value={formState.description}
                  onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  placeholder="Descreva o produto de forma clara e atrativa para o cliente."
                  required
                />
              </label>

              <div className="field">
                <span className="field-label">Categoria</span>
                <Input
                  id="product-category"
                  value={formState.category}
                  onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Ex: Moda"
                  required
                />
                <div className="chip-row">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`chip chip-btn ${formState.category === cat ? 'chip-btn-active' : ''}`}
                      onClick={() => setFormState((current) => ({ ...current, category: cat }))}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Seção 3: Preço e estoque */}
            <Card title="Preço e estoque" variant="layered">
              <div className="grid grid-3">
                <Input
                  id="product-price"
                  label={isService ? 'Preço (opcional)' : 'Preço (R$)'}
                  type="number"
                  min={0}
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))}
                  required={!isService}
                  placeholder="0,00"
                />
                <div className="field">
                  <Input
                    id="product-stock"
                    label={isPhysical ? 'Estoque' : 'Estoque (N/A)'}
                    type="number"
                    min={0}
                    value={formState.stock}
                    onChange={(event) => setFormState((current) => ({ ...current, stock: event.target.value }))}
                    required={isPhysical}
                    disabled={!isPhysical}
                    placeholder={isPhysical ? '0' : '—'}
                  />
                  {!isPhysical && (
                    <span className="field-help">Não se aplica para este tipo.</span>
                  )}
                </div>
                <div />
              </div>
            </Card>

            {/* Seção 4: Imagem */}
            <Card title="Imagem e visual" variant="layered">
              <div className="field">
                <Input
                  id="product-image-url"
                  label="URL da imagem"
                  value={formState.imageUrl}
                  onChange={(event) => setFormState((current) => ({ ...current, imageUrl: event.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
                <span className="field-help">
                  Por enquanto, use uma URL de imagem. Upload real virá na integração com storage.
                </span>
              </div>
            </Card>

            {/* Seção 5: Link externo (condicional) */}
            {requiresExternalUrl && (
              <Card title="Link e ação externa" variant="layered">
                <div className="field">
                  <Input
                    id="product-external-url"
                    label="URL externa"
                    value={formState.externalUrl}
                    onChange={(event) => setFormState((current) => ({ ...current, externalUrl: event.target.value }))}
                    placeholder="https://loja.com/produto"
                    required
                  />
                  <span className="field-help">
                    O cliente será redirecionado para esta URL ao clicar no botão de ação.
                  </span>
                </div>

                <Input
                  id="product-sponsored-label"
                  label="Aviso curto (opcional)"
                  value={formState.sponsoredLabel}
                  onChange={(event) => setFormState((current) => ({ ...current, sponsoredLabel: event.target.value }))}
                  placeholder="Ex: Conteúdo patrocinado"
                />

                {formState.productType === 'affiliate' && (
                  <div className="field">
                    <Input
                      id="product-affiliate-disclaimer"
                      label="Aviso de transparência (recomendado)"
                      value={formState.affiliateDisclaimer}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, affiliateDisclaimer: event.target.value }))
                      }
                      placeholder="Ex: Compra realizada fora da plataforma."
                    />
                    <span className="field-help">
                      Informe claramente que a compra acontece fora da plataforma.
                    </span>
                  </div>
                )}
              </Card>
            )}

            {/* Seção 6: CTA (serviço e externos) */}
            {showCta && (
              <Card title="Texto do botão de ação" variant="layered">
                <div className="field">
                  <Input
                    id="product-cta-label"
                    label="Texto do botão (opcional)"
                    value={formState.ctaLabel}
                    onChange={(event) => setFormState((current) => ({ ...current, ctaLabel: event.target.value }))}
                    placeholder="Ex: Falar com a loja"
                  />
                  <div className="chip-row">
                    {CTA_SUGGESTIONS[formState.productType].map((cta) => (
                      <button
                        key={cta}
                        type="button"
                        className={`chip chip-btn ${formState.ctaLabel === cta ? 'chip-btn-active' : ''}`}
                        onClick={() => setFormState((current) => ({ ...current, ctaLabel: cta }))}
                      >
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Seção 7: Status de publicação */}
            <Card title="Status de publicação" variant="layered">
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
                <option value="active">Ativo — aparece na vitrine</option>
                <option value="paused">Pausado — oculto na vitrine</option>
              </Select>
            </Card>
          </div>

          {/* ── Preview column ── */}
          <ProductPreview form={formState} />
        </div>

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
    </section>
  )
}
