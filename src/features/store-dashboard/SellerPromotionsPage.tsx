import { useCallback, useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import {
  createPromotion,
  deletePromotion,
  getPromotionsByStore,
  togglePromotionActive,
  updatePromotion,
} from '../../services/mockData'
import type { Promotion } from '../../services/localMockStore'

type PromotionForm = {
  title: string
  description: string
  bannerText: string
  highlightColor: string
  expiresAt: string
}

const emptyForm: PromotionForm = {
  title: '',
  description: '',
  bannerText: '',
  highlightColor: '',
  expiresAt: '',
}

function toISODate(value: string): string | undefined {
  if (!value) return undefined
  return new Date(value).toISOString()
}

export function SellerPromotionsPage() {
  const { storeId } = useMockSession()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionForm>(emptyForm)
  const [errorMessage, setErrorMessage] = useState('')

  const refreshPromotions = useCallback(() => {
    getPromotionsByStore(storeId).then(setPromotions)
  }, [storeId])

  useEffect(() => {
    refreshPromotions()
  }, [refreshPromotions])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrorMessage('')
    setShowForm(true)
  }

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingId(promotion.id)
    setForm({
      title: promotion.title,
      description: promotion.description,
      bannerText: promotion.bannerText ?? '',
      highlightColor: promotion.highlightColor ?? '',
      expiresAt: promotion.expiresAt ? promotion.expiresAt.slice(0, 10) : '',
    })
    setErrorMessage('')
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setErrorMessage('')
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setErrorMessage('Informe o título da promoção.')
      return
    }

    const payload = {
      store_id: storeId,
      title: form.title.trim(),
      description: form.description.trim(),
      bannerText: form.bannerText.trim() || undefined,
      highlightColor: form.highlightColor.trim() || undefined,
      expiresAt: toISODate(form.expiresAt),
      active: true,
    }

    try {
      if (editingId) {
        await updatePromotion(editingId, payload)
      } else {
        await createPromotion(payload)
      }
      setShowForm(false)
      setEditingId(null)
      refreshPromotions()
    } catch {
      setErrorMessage('Erro ao salvar promoção. Tente novamente.')
    }
  }

  const handleToggle = async (id: string) => {
    await togglePromotionActive(id)
    refreshPromotions()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta promoção?')) return
    await deletePromotion(id)
    refreshPromotions()
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Promoções"
        icon="tag"
        title="Ative campanhas da sua loja"
        description="Crie promoções para aumentar conversão e atrair novos pedidos."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Nova promoção
        </Button>
      </div>

      {showForm && (
        <Card
          title={editingId ? 'Editar promoção' : 'Nova promoção'}
          subtitle="Preencha os detalhes da campanha"
          variant="accentCorner"
        >
          <div className="stack" style={{ gap: '0.75rem' }}>
            <Input
              label="Título da promoção"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Semana do café"
            />
            <Input
              label="Descrição"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descreva a promoção para seus clientes"
            />
            <Input
              label="Texto do banner — opcional"
              value={form.bannerText}
              onChange={(e) => setForm({ ...form, bannerText: e.target.value })}
              placeholder="Ex: ☕ Kit barista com 15% OFF esta semana!"
            />
            <Input
              label="Cor de destaque — opcional (hex)"
              value={form.highlightColor}
              onChange={(e) => setForm({ ...form, highlightColor: e.target.value })}
              placeholder="#FF7A59"
            />
            <Input
              label="Validade — opcional"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div className="inline-info">
              <Button variant="primary" onClick={handleSave}>
                Salvar
              </Button>
              <Button variant="ghost" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {promotions.length === 0 ? (
        <p className="empty-state">Nenhuma promoção cadastrada. Crie a primeira campanha para começar.</p>
      ) : (
        <div className="grid">
          {promotions.map((promo) => (
            <Card
              key={promo.id}
              title={promo.title}
              subtitle={promo.description}
              variant="layered"
            >
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <Badge variant={promo.active ? 'success' : 'muted'}>
                  {promo.active ? 'Ativa' : 'Inativa'}
                </Badge>
                {promo.expiresAt && (
                  <Badge variant="muted">
                    Válida até {new Date(promo.expiresAt).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>
              {promo.bannerText && (
                <p
                  style={{
                    background: promo.highlightColor ?? 'var(--color-accent)',
                    color: '#fff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {promo.bannerText}
                </p>
              )}
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <Button variant="secondary" onClick={() => handleOpenEdit(promo)}>
                  Editar
                </Button>
                <Button variant="ghost" onClick={() => handleToggle(promo.id)}>
                  {promo.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(promo.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
