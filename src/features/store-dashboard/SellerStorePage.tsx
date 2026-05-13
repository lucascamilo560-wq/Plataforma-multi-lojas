import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, updateStoreProfile } from '../../services/mockData'
import type { Store } from '../../types'

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

export function SellerStorePage() {
  const { storeId } = useMockSession()
  const [formState, setFormState] = useState<StoreFormState>(emptyFormState)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadStore = useCallback(() => {
    getStoreById(storeId).then((store) => {
      if (store) setFormState(toFormState(store))
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
    </section>
  )
}
