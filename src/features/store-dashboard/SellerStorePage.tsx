import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, updateStoreProfile } from '../../services/mockData'
import type { Store, StoreBusinessHours, StoreBusinessDay } from '../../types'

interface StoreFormState {
  name: string
  category: string
  city: string
  description: string
  whatsapp: string
  isActive: 'open' | 'paused'
  logoUrl: string
  coverUrl: string
  primaryColor: string
  accentColor: string
}

function toFormState(store: Store): StoreFormState {
  return {
    name: store.name,
    category: store.category,
    city: store.city,
    description: store.description,
    whatsapp: store.whatsapp ?? '',
    isActive: store.isActive ? 'open' : 'paused',
    logoUrl: store.logoUrl ?? '',
    coverUrl: store.coverUrl ?? '',
    primaryColor: store.primaryColor ?? '#14213D',
    accentColor: store.accentColor ?? '#3A86FF',
  }
}

const emptyFormState: StoreFormState = {
  name: '',
  category: '',
  city: '',
  description: '',
  whatsapp: '',
  isActive: 'open',
  logoUrl: '',
  coverUrl: '',
  primaryColor: '#14213D',
  accentColor: '#3A86FF',
}

const DAYS: { slug: StoreBusinessDay; label: string }[] = [
  { slug: 'monday', label: 'Segunda' },
  { slug: 'tuesday', label: 'Terça' },
  { slug: 'wednesday', label: 'Quarta' },
  { slug: 'thursday', label: 'Quinta' },
  { slug: 'friday', label: 'Sexta' },
  { slug: 'saturday', label: 'Sábado' },
  { slug: 'sunday', label: 'Domingo' },
]

const DEFAULT_HOURS: StoreBusinessHours[] = DAYS.map((d, i) => ({
  day: d.slug,
  enabled: i < 5, // segunda a sexta
  openTime: '08:00',
  closeTime: '18:00',
}))

export function SellerStorePage() {
  const { storeId } = useMockSession()
  const [formState, setFormState] = useState<StoreFormState>(emptyFormState)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Business hours state
  const [businessHours, setBusinessHours] = useState<StoreBusinessHours[]>(DEFAULT_HOURS)
  const [acceptOrdersWhenClosed, setAcceptOrdersWhenClosed] = useState(false)
  const [vacationMode, setVacationMode] = useState(false)
  const [vacationMessage, setVacationMessage] = useState('')
  const [hoursSuccessMessage, setHoursSuccessMessage] = useState('')

  const loadStore = useCallback(() => {
    getStoreById(storeId).then((store) => {
      if (store) {
        setFormState(toFormState(store))
        setBusinessHours(store.businessHours ?? DEFAULT_HOURS)
        setAcceptOrdersWhenClosed(store.acceptOrdersWhenClosed ?? false)
        setVacationMode(store.vacationMode ?? false)
        setVacationMessage(store.vacationMessage ?? '')
      }
    })
  }, [storeId])

  useEffect(() => {
    loadStore()
  }, [loadStore])

  const handleChange = (field: keyof StoreFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    if (!formState.name.trim()) {
      setErrorMessage('Informe o nome da loja.')
      return
    }

    await updateStoreProfile(storeId, {
      name: formState.name.trim(),
      category: formState.category.trim(),
      city: formState.city.trim(),
      description: formState.description.trim(),
      whatsapp: formState.whatsapp.trim() || undefined,
      isActive: formState.isActive === 'open',
      logoUrl: formState.logoUrl.trim() || undefined,
      coverUrl: formState.coverUrl.trim() || undefined,
      primaryColor: formState.primaryColor.trim() || undefined,
      accentColor: formState.accentColor.trim() || undefined,
    })

    setSuccessMessage('Dados da loja salvos com sucesso.')
  }

  const handleDayToggle = (day: StoreBusinessDay) => {
    setBusinessHours((prev) =>
      prev.map((bh) => (bh.day === day ? { ...bh, enabled: !bh.enabled } : bh)),
    )
    setHoursSuccessMessage('')
  }

  const handleHourChange = (day: StoreBusinessDay, field: 'openTime' | 'closeTime', value: string) => {
    setBusinessHours((prev) =>
      prev.map((bh) => (bh.day === day ? { ...bh, [field]: value } : bh)),
    )
    setHoursSuccessMessage('')
  }

  const handleCopyWeekdays = () => {
    const monday = businessHours.find((bh) => bh.day === 'monday')
    if (!monday) return
    setBusinessHours((prev) =>
      prev.map((bh) => {
        const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(bh.day)
        return isWeekday ? { ...bh, enabled: monday.enabled, openTime: monday.openTime, closeTime: monday.closeTime } : bh
      }),
    )
    setHoursSuccessMessage('')
  }

  const handleSaveHours = async () => {
    setHoursSuccessMessage('')

    // Validate: active days must have valid times
    for (const bh of businessHours) {
      if (bh.enabled) {
        if (!bh.openTime || !bh.closeTime) {
          setHoursSuccessMessage('⚠️ Preencha abertura e fechamento para todos os dias ativos.')
          return
        }
        const openMin = Number(bh.openTime.replace(':', ''))
        const closeMin = Number(bh.closeTime.replace(':', ''))
        if (closeMin <= openMin) {
          const dayLabel = DAYS.find((d) => d.slug === bh.day)?.label ?? bh.day
          setHoursSuccessMessage(`⚠️ ${dayLabel}: horário de fechamento deve ser depois da abertura.`)
          return
        }
      }
    }

    await updateStoreProfile(storeId, {
      businessHours,
      acceptOrdersWhenClosed,
      vacationMode,
      vacationMessage: vacationMessage.trim() || undefined,
    })

    setHoursSuccessMessage('Horários salvos com sucesso.')
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Minha loja"
        icon="storefront"
        title="Gerencie dados da sua loja"
        description="Atualize nome, descrição, contato, cores e status de atendimento."
      />

      <Card title="Configurações da loja" subtitle="Nome, endereço, contato e status de atendimento" variant="layered">
        <form className="stack" onSubmit={handleSubmit}>
          <div className="grid grid-3">
            <Input
              id="store-name"
              label="Nome da loja"
              value={formState.name}
              onChange={handleChange('name')}
              required
            />
            <Input
              id="store-category"
              label="Categoria"
              value={formState.category}
              onChange={handleChange('category')}
              placeholder="Ex: Restaurante, Moda, Serviços"
            />
            <Input
              id="store-city"
              label="Cidade"
              value={formState.city}
              onChange={handleChange('city')}
            />
          </div>

          <label className="field" htmlFor="store-description">
            <span className="field-label">Descrição</span>
            <textarea
              id="store-description"
              className="input"
              value={formState.description}
              onChange={handleChange('description')}
              rows={3}
            />
          </label>

          <div className="grid grid-3">
            <Input
              id="store-whatsapp"
              label="WhatsApp"
              value={formState.whatsapp}
              onChange={handleChange('whatsapp')}
              placeholder="Ex: 5511999990001"
            />
            <Select
              id="store-status"
              label="Status da loja"
              value={formState.isActive}
              onChange={handleChange('isActive')}
            >
              <option value="open">Aberta</option>
              <option value="paused">Pausada</option>
            </Select>
          </div>

          <div className="grid grid-3">
            <Input
              id="store-logo"
              label="Logo (URL da imagem)"
              value={formState.logoUrl}
              onChange={handleChange('logoUrl')}
              placeholder="https://..."
            />
            <Input
              id="store-cover"
              label="Banner (URL da imagem)"
              value={formState.coverUrl}
              onChange={handleChange('coverUrl')}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-3">
            <div className="field">
              <label className="field-label" htmlFor="store-primary-color">Cor principal</label>
              <div className="inline-info" style={{ gap: '0.5rem' }}>
                <input
                  id="store-primary-color"
                  type="color"
                  value={formState.primaryColor}
                  onChange={handleChange('primaryColor')}
                  style={{ width: '2.5rem', height: '2.5rem', cursor: 'pointer', border: 'none', background: 'none' }}
                />
                <input
                  type="text"
                  className="input"
                  value={formState.primaryColor}
                  onChange={handleChange('primaryColor')}
                  placeholder="#14213D"
                />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="store-accent-color">Cor de destaque</label>
              <div className="inline-info" style={{ gap: '0.5rem' }}>
                <input
                  id="store-accent-color"
                  type="color"
                  value={formState.accentColor}
                  onChange={handleChange('accentColor')}
                  style={{ width: '2.5rem', height: '2.5rem', cursor: 'pointer', border: 'none', background: 'none' }}
                />
                <input
                  type="text"
                  className="input"
                  value={formState.accentColor}
                  onChange={handleChange('accentColor')}
                  placeholder="#3A86FF"
                />
              </div>
            </div>
          </div>

          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {successMessage && <p className="muted" style={{ color: 'var(--color-success, green)' }}>{successMessage}</p>}

          <div className="inline-info">
            <Button type="submit" variant="accent">Salvar dados da loja</Button>
          </div>
        </form>
      </Card>

      {/* Business Hours */}
      <Card title="Horário de funcionamento" subtitle="Defina os dias e horários de atendimento" variant="layered">
        <div className="stack">
          {/* Vacation mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: '0.6rem', background: vacationMode ? 'var(--color-warning-subtle, #fffbeb)' : 'var(--color-surface-raised, #f9fafb)', border: '1px solid var(--color-border)' }}>
            <input
              id="vacation-mode"
              type="checkbox"
              checked={vacationMode}
              onChange={(e) => { setVacationMode(e.target.checked); setHoursSuccessMessage('') }}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label htmlFor="vacation-mode" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.93rem' }}>
              🏖️ Modo férias — pausar atendimento temporariamente
            </label>
          </div>

          {vacationMode && (
            <label className="field" htmlFor="vacation-message">
              <span className="field-label">Mensagem de férias (opcional)</span>
              <textarea
                id="vacation-message"
                className="input"
                value={vacationMessage}
                onChange={(e) => { setVacationMessage(e.target.value); setHoursSuccessMessage('') }}
                rows={2}
                placeholder="Ex: Voltamos em 20/06! Pedidos feitos agora serão atendidos na reabertura."
              />
            </label>
          )}

          {/* Days grid */}
          <div className="stack" style={{ gap: '0.4rem' }}>
            {businessHours.map((bh) => {
              const dayLabel = DAYS.find((d) => d.slug === bh.day)?.label ?? bh.day
              return (
                <div
                  key={bh.day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-border)',
                    background: bh.enabled ? 'var(--color-surface, #fff)' : 'var(--color-surface-raised, #f9fafb)',
                    opacity: bh.enabled ? 1 : 0.6,
                  }}
                >
                  <input
                    id={`day-${bh.day}`}
                    type="checkbox"
                    checked={bh.enabled}
                    onChange={() => handleDayToggle(bh.day)}
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <label
                    htmlFor={`day-${bh.day}`}
                    style={{ minWidth: '5rem', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                  >
                    {dayLabel}
                  </label>
                  {bh.enabled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <input
                        type="time"
                        className="input"
                        value={bh.openTime}
                        onChange={(e) => handleHourChange(bh.day, 'openTime', e.target.value)}
                        style={{ width: '7.5rem', fontSize: '0.88rem', padding: '0.3rem 0.5rem' }}
                        aria-label={`Abertura ${dayLabel}`}
                      />
                      <span className="muted" style={{ fontSize: '0.82rem' }}>até</span>
                      <input
                        type="time"
                        className="input"
                        value={bh.closeTime}
                        onChange={(e) => handleHourChange(bh.day, 'closeTime', e.target.value)}
                        style={{ width: '7.5rem', fontSize: '0.88rem', padding: '0.3rem 0.5rem' }}
                        aria-label={`Fechamento ${dayLabel}`}
                      />
                    </div>
                  ) : (
                    <span className="muted" style={{ fontSize: '0.82rem' }}>Fechado</span>
                  )}
                </div>
              )
            })}
          </div>

          <Button type="button" variant="ghost" onClick={handleCopyWeekdays} style={{ alignSelf: 'flex-start', fontSize: '0.82rem' }}>
            Copiar horário de segunda para todos os dias úteis
          </Button>

          {/* Accept orders when closed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: '0.6rem', border: '1px solid var(--color-border)', background: 'var(--color-surface-raised, #f9fafb)' }}>
            <input
              id="accept-orders-closed"
              type="checkbox"
              checked={acceptOrdersWhenClosed}
              onChange={(e) => { setAcceptOrdersWhenClosed(e.target.checked); setHoursSuccessMessage('') }}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label htmlFor="accept-orders-closed" style={{ cursor: 'pointer', fontSize: '0.93rem' }}>
              Aceitar pedidos fora do horário de funcionamento
            </label>
          </div>

          {/* Preview */}
          <div style={{ padding: '0.75rem 1rem', borderRadius: '0.6rem', background: 'var(--color-surface-raised, #f9fafb)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
            <p style={{ margin: '0 0 0.35rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Como aparecerá para o cliente:
            </p>
            {vacationMode ? (
              <p style={{ margin: 0, color: 'var(--color-warning, #d97706)' }}>🏖️ Em férias — {vacationMessage.trim() || 'Loja em período de férias.'}</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                {businessHours.filter((bh) => bh.enabled).length === 0 ? (
                  <li>Nenhum dia ativo — loja aparecerá como aberta (sem restrição de horário).</li>
                ) : (
                  businessHours.filter((bh) => bh.enabled).map((bh) => {
                    const label = DAYS.find((d) => d.slug === bh.day)?.label ?? bh.day
                    return <li key={bh.day}>{label}: {bh.openTime} – {bh.closeTime}</li>
                  })
                )}
              </ul>
            )}
            {acceptOrdersWhenClosed && !vacationMode && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ℹ️ Aceita pedidos fora do horário com aviso ao cliente.
              </p>
            )}
          </div>

          {hoursSuccessMessage && (
            <p
              className={hoursSuccessMessage.startsWith('⚠️') ? 'error-text' : 'muted'}
              style={hoursSuccessMessage.startsWith('⚠️') ? undefined : { color: 'var(--color-success, green)' }}
            >
              {hoursSuccessMessage}
            </p>
          )}

          <div className="inline-info">
            <Button type="button" variant="accent" onClick={handleSaveHours}>Salvar horários</Button>
          </div>
        </div>
      </Card>
    </section>
  )
}
