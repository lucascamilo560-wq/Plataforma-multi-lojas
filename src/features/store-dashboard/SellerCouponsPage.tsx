import { useCallback, useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { useMockSession } from '../../hooks/useMockSession'
import {
  createCoupon,
  deleteCoupon,
  getCouponsByStore,
  toggleCouponActive,
  updateCoupon,
} from '../../services/mockData'
import type { Coupon } from '../../services/localMockStore'
import { formatCurrency } from '../../utils/currency'

type CouponForm = {
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: string
  minOrderValue: string
  usageLimit: string
  expiresAt: string
  description: string
}

const emptyForm: CouponForm = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  minOrderValue: '',
  usageLimit: '',
  expiresAt: '',
  description: '',
}

function toISODate(value: string): string | undefined {
  if (!value) return undefined
  return new Date(value).toISOString()
}

export function SellerCouponsPage() {
  const { storeId } = useMockSession()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponForm>(emptyForm)
  const [errorMessage, setErrorMessage] = useState('')

  const refreshCoupons = useCallback(() => {
    getCouponsByStore(storeId).then(setCoupons)
  }, [storeId])

  useEffect(() => {
    refreshCoupons()
  }, [refreshCoupons])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrorMessage('')
    setShowForm(true)
  }

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      description: coupon.description ?? '',
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
    if (!form.code.trim()) {
      setErrorMessage('Informe o código do cupom.')
      return
    }
    const discountValue = parseFloat(form.discountValue)
    if (isNaN(discountValue) || discountValue <= 0) {
      setErrorMessage('Informe um valor de desconto válido.')
      return
    }
    if (form.discountType === 'percent' && discountValue > 100) {
      setErrorMessage('Desconto percentual não pode ultrapassar 100%.')
      return
    }

    const payload = {
      store_id: storeId,
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue,
      minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      expiresAt: toISODate(form.expiresAt),
      description: form.description.trim() || undefined,
      active: true,
      usedCount: 0,
    }

    try {
      if (editingId) {
        await updateCoupon(editingId, payload)
      } else {
        await createCoupon(payload)
      }
      setShowForm(false)
      setEditingId(null)
      refreshCoupons()
    } catch {
      setErrorMessage('Erro ao salvar cupom. Tente novamente.')
    }
  }

  const handleToggle = async (id: string) => {
    await toggleCouponActive(id)
    refreshCoupons()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este cupom?')) return
    await deleteCoupon(id)
    refreshCoupons()
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Cupons"
        icon="tag"
        title="Gerencie cupons de desconto"
        description="Configure cupons para aumentar recorrência e fidelização de clientes."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Novo cupom
        </Button>
      </div>

      {showForm && (
        <Card
          title={editingId ? 'Editar cupom' : 'Novo cupom'}
          subtitle="Preencha as regras do cupom"
          variant="accentCorner"
        >
          <div className="stack" style={{ gap: '0.75rem' }}>
            <Input
              label="Código do cupom"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Ex: BEMVINDO10"
            />
            <Select
              label="Tipo de desconto"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percent' | 'fixed' })}
            >
              <option value="percent">Porcentagem (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </Select>
            <Input
              label={form.discountType === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}
              type="number"
              min="0"
              max={form.discountType === 'percent' ? '100' : undefined}
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              placeholder={form.discountType === 'percent' ? 'Ex: 10' : 'Ex: 15.00'}
            />
            <Input
              label="Pedido mínimo (R$) — opcional"
              type="number"
              min="0"
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
              placeholder="Ex: 50.00"
            />
            <Input
              label="Limite de uso — opcional"
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Ex: 100"
            />
            <Input
              label="Validade — opcional"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <Input
              label="Descrição — opcional"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descrição interna do cupom"
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

      {coupons.length === 0 ? (
        <p className="empty-state">Nenhum cupom cadastrado. Crie o primeiro cupom para começar.</p>
      ) : (
        <div className="grid">
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              title={coupon.code}
              subtitle={coupon.description ?? (coupon.discountType === 'percent' ? `${coupon.discountValue}% de desconto` : `${formatCurrency(coupon.discountValue)} de desconto`)}
              variant="layered"
            >
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <Badge variant={coupon.active ? 'success' : 'muted'}>
                  {coupon.active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant="accent">
                  {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
                </Badge>
                {coupon.minOrderValue != null && (
                  <Badge variant="muted">Mínimo: {formatCurrency(coupon.minOrderValue)}</Badge>
                )}
                {coupon.expiresAt && (
                  <Badge variant="muted">
                    Válido até {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>
              <div className="stack" style={{ gap: '0.25rem' }}>
                <small className="muted">
                  Usos: {coupon.usedCount}
                  {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}
                </small>
              </div>
              <div className="inline-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <Button variant="secondary" onClick={() => handleOpenEdit(coupon)}>
                  Editar
                </Button>
                <Button variant="ghost" onClick={() => handleToggle(coupon.id)}>
                  {coupon.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(coupon.id)}>
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
