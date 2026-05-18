import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  getCustomerProfile,
  getPendingStoreInvite,
  isCustomerProfileComplete,
  updateCustomerProfile,
} from '../../services/mockData'
import type { CustomerProfile } from '../../services/mockData'

function emptyProfile(): CustomerProfile {
  return {
    fullName: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryReference: '',
    updatedAt: '',
  }
}

export function CustomerProfilePage() {
  const navigate = useNavigate()
  const savedProfile = getCustomerProfile()
  const pendingInvite = getPendingStoreInvite()

  const [form, setForm] = useState<CustomerProfile>(() => ({
    ...emptyProfile(),
    ...savedProfile,
  }))
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerProfile, string>>>({})

  const complete = isCustomerProfileComplete(form)

  function setField(field: keyof CustomerProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const required: Array<keyof CustomerProfile> = [
      'fullName',
      'phone',
      'street',
      'number',
      'neighborhood',
      'city',
      'state',
      'zipCode',
    ]
    const next: Partial<Record<keyof CustomerProfile, string>> = {}
    let ok = true
    for (const field of required) {
      if (!form[field]?.trim()) {
        next[field] = 'Campo obrigatório'
        ok = false
      }
    }
    setErrors(next)
    return ok
  }

  function handleSave() {
    if (!validate()) return
    updateCustomerProfile({ ...form, updatedAt: new Date().toISOString() })
    setSaved(true)
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Perfil"
        icon="user"
        title="Meu perfil"
        description="Preencha seus dados para comprar com mais praticidade."
      />

      {/* Status indicator */}
      <div
        style={{
          padding: '0.65rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          background: complete
            ? 'var(--color-success-subtle, #f0fdf4)'
            : 'var(--color-warning-subtle, #fffbeb)',
          border: `1px solid ${complete ? 'var(--color-success, #16a34a)' : 'var(--color-warning, #d97706)'}`,
          color: complete ? 'var(--color-success, #16a34a)' : 'var(--color-warning, #d97706)',
        }}
      >
        {complete ? '✅ Perfil completo — você pode confirmar pedidos.' : '⚠️ Perfil incompleto — preencha os campos obrigatórios para confirmar pedidos.'}
      </div>

      <Card title="Dados pessoais" subtitle="Nome e telefone para contato" variant="accentCorner">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <Input
            label="Nome completo *"
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            placeholder="Seu nome completo"
          />
          {errors.fullName && <p className="error-text">{errors.fullName}</p>}

          <Input
            label="Telefone / WhatsApp *"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="(11) 99999-0000"
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>
      </Card>

      <Card title="Endereço" subtitle="Para agilizar a entrega dos pedidos" variant="layered">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <Input
            label="CEP *"
            value={form.zipCode}
            onChange={(e) => setField('zipCode', e.target.value)}
            placeholder="00000-000"
          />
          {errors.zipCode && <p className="error-text">{errors.zipCode}</p>}

          <Input
            label="Rua / Logradouro *"
            value={form.street}
            onChange={(e) => setField('street', e.target.value)}
            placeholder="Nome da rua ou avenida"
          />
          {errors.street && <p className="error-text">{errors.street}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <Input
                label="Número *"
                value={form.number}
                onChange={(e) => setField('number', e.target.value)}
                placeholder="Ex: 123"
              />
              {errors.number && <p className="error-text">{errors.number}</p>}
            </div>
            <Input
              label="Complemento"
              value={form.complement ?? ''}
              onChange={(e) => setField('complement', e.target.value)}
              placeholder="Apto, bloco…"
            />
          </div>

          <Input
            label="Bairro *"
            value={form.neighborhood}
            onChange={(e) => setField('neighborhood', e.target.value)}
            placeholder="Nome do bairro"
          />
          {errors.neighborhood && <p className="error-text">{errors.neighborhood}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
            <div>
              <Input
                label="Cidade *"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="Sua cidade"
              />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div>
              <Input
                label="Estado *"
                value={form.state}
                onChange={(e) => setField('state', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                style={{ width: '4.5rem' }}
              />
              {errors.state && <p className="error-text">{errors.state}</p>}
            </div>
          </div>

          <Input
            label="Referência de entrega"
            value={form.deliveryReference ?? ''}
            onChange={(e) => setField('deliveryReference', e.target.value)}
            placeholder="Ex: portão azul, ao lado da padaria…"
          />
        </div>
      </Card>

      {saved && (
        <p style={{ color: 'var(--color-success, #16a34a)', fontWeight: 600, fontSize: '0.95rem' }}>
          ✅ Perfil salvo com sucesso!
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {pendingInvite && (
          <Button variant="secondary" onClick={() => navigate(`/loja/${pendingInvite.slug}`)}>
            Ver loja {pendingInvite.storeName}
          </Button>
        )}
        <Button variant="primary" onClick={handleSave}>
          Salvar perfil
        </Button>
      </div>
    </section>
  )
}
