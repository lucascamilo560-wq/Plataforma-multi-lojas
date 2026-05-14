import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { createStore } from '../../services/mockData'

export function SellerCreateStorePage() {
  const navigate = useNavigate()
  const { setStoreId } = useMockSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const form = event.currentTarget
    const data = new FormData(form)

    const name = (data.get('name') as string).trim()
    const category = (data.get('category') as string).trim()
    const city = (data.get('city') as string).trim()
    const description = (data.get('description') as string).trim()
    const whatsapp = (data.get('whatsapp') as string).trim()
    const primaryColor = (data.get('primaryColor') as string).trim()
    const accentColor = (data.get('accentColor') as string).trim()
    const logoUrl = (data.get('logoUrl') as string).trim()
    const coverUrl = (data.get('coverUrl') as string).trim()

    if (!name || !category || !city || !description) {
      setErrorMessage('Preencha todos os campos obrigatórios.')
      setIsSubmitting(false)
      return
    }

    try {
      const store = await createStore({
        name,
        category,
        city,
        description,
        whatsapp: whatsapp || undefined,
        primaryColor: primaryColor || undefined,
        accentColor: accentColor || undefined,
        logoUrl: logoUrl || undefined,
        coverUrl: coverUrl || undefined,
      })
      setStoreId(store.id)
      navigate('/lojista', { state: { justCreated: true } })
    } catch (error) {
      console.error('Erro ao criar loja:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a loja. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="stack-xl">
      <PageHeader
        kicker="Nova loja"
        icon="storefront"
        title="Crie sua loja"
        description="Preencha os dados abaixo para criar sua vitrine digital. Após criar, você receberá o link para compartilhar com seus clientes."
      />

      <Card title="Dados da loja" subtitle="Campos obrigatórios marcados com *" variant="accentCorner">
        <form className="stack" onSubmit={handleSubmit}>
          <Input
            id="name"
            name="name"
            label="Nome da loja *"
            placeholder="Ex: Padaria do João"
            required
          />
          <Input
            id="category"
            name="category"
            label="Categoria *"
            placeholder="Ex: Padaria, Cafeteria, Moda…"
            required
          />
          <Input
            id="city"
            name="city"
            label="Cidade *"
            placeholder="Ex: São Paulo"
            required
          />
          <Input
            id="description"
            name="description"
            label="Descrição *"
            placeholder="Descreva brevemente sua loja e o que você vende"
            required
          />
          <Input
            id="whatsapp"
            name="whatsapp"
            label="WhatsApp (opcional)"
            placeholder="5511999990000"
          />

          <div className="grid" style={{ gap: '0.75rem' }}>
            <div>
              <label htmlFor="primaryColor" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Cor principal (opcional)
              </label>
              <input
                id="primaryColor"
                name="primaryColor"
                type="color"
                defaultValue="#14213D"
                style={{ width: '3rem', height: '2.25rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', cursor: 'pointer', padding: '0.1rem' }}
              />
            </div>
            <div>
              <label htmlFor="accentColor" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Cor de destaque (opcional)
              </label>
              <input
                id="accentColor"
                name="accentColor"
                type="color"
                defaultValue="#3A86FF"
                style={{ width: '3rem', height: '2.25rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', cursor: 'pointer', padding: '0.1rem' }}
              />
            </div>
          </div>

          <Input
            id="logoUrl"
            name="logoUrl"
            label="URL do logo (opcional)"
            placeholder="https://exemplo.com/logo.png"
          />
          <Input
            id="coverUrl"
            name="coverUrl"
            label="URL do banner (opcional)"
            placeholder="https://exemplo.com/banner.jpg"
          />

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <div className="inline-info">
            <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>
              <Icon name="check" className="icon-sm" />
              {isSubmitting ? 'Criando loja…' : 'Criar loja'}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
