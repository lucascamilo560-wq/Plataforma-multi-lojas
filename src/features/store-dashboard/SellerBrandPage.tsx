import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, updateStoreTheme } from '../../services/mockData'
import { THEME_PRESETS, getStoreTheme } from '../../styles/storeTheme'
import type { Store, StoreButtonStyle, StoreCardStyle, StoreHeroStyle, StoreNavigationStyle, StoreProductLayout } from '../../types'

interface BrandFormState {
  logoUrl: string
  coverUrl: string
  slogan: string
  shortDescription: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  themePreset: string
  buttonStyle: StoreButtonStyle
  cardStyle: StoreCardStyle
  productLayout: StoreProductLayout
  navigationStyle: StoreNavigationStyle
  heroStyle: StoreHeroStyle
  showHero: boolean
  showLoyaltyBlock: boolean
  showPromotionsSection: boolean
  showBestSellersSection: boolean
  showWhatsappFloat: boolean
}

function toFormState(store: Store): BrandFormState {
  const theme = getStoreTheme(store)
  return {
    logoUrl: store.logoUrl ?? '',
    coverUrl: store.coverUrl ?? '',
    slogan: store.slogan ?? '',
    shortDescription: store.shortDescription ?? '',
    primaryColor: store.primaryColor ?? theme.primaryColor,
    secondaryColor: store.secondaryColor ?? theme.secondaryColor,
    accentColor: store.accentColor ?? theme.accentColor,
    themePreset: store.themePreset ?? '',
    buttonStyle: store.buttonStyle ?? theme.buttonStyle,
    cardStyle: store.cardStyle ?? theme.cardStyle,
    productLayout: store.productLayout ?? theme.productLayout,
    navigationStyle: store.navigationStyle ?? theme.navigationStyle,
    heroStyle: store.heroStyle ?? theme.heroStyle,
    showHero: store.showHero ?? theme.showHero,
    showLoyaltyBlock: store.showLoyaltyBlock ?? theme.showLoyaltyBlock,
    showPromotionsSection: store.showPromotionsSection ?? theme.showPromotionsSection,
    showBestSellersSection: store.showBestSellersSection ?? theme.showBestSellersSection,
    showWhatsappFloat: store.showWhatsappFloat ?? theme.showWhatsappFloat,
  }
}

const emptyFormState: BrandFormState = {
  logoUrl: '',
  coverUrl: '',
  slogan: '',
  shortDescription: '',
  primaryColor: '#162b4d',
  secondaryColor: '#e8eef9',
  accentColor: '#3a86ff',
  themePreset: '',
  buttonStyle: 'rounded',
  cardStyle: 'elevated',
  productLayout: 'grid-2',
  navigationStyle: 'chips',
  heroStyle: 'cover',
  showHero: true,
  showLoyaltyBlock: true,
  showPromotionsSection: true,
  showBestSellersSection: false,
  showWhatsappFloat: true,
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="inline-info" style={{ gap: '0.5rem' }}>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '2.6rem', height: '2.6rem', cursor: 'pointer', border: 'none', background: 'none', borderRadius: '8px' }}
        />
        <input
          type="text"
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          style={{ maxWidth: '120px' }}
        />
        <div
          style={{
            width: '2.2rem',
            height: '2.2rem',
            borderRadius: '8px',
            background: value,
            border: '1px solid var(--border)',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

function ToggleField({ id, label, description, checked, onChange }: { id: string; label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        padding: '0.6rem 0.8rem',
        borderRadius: '10px',
        border: '1px solid var(--border-soft)',
        background: 'var(--surface-alt)',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
      />
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
        {description && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{description}</p>}
      </div>
    </label>
  )
}

export function SellerBrandPage() {
  const { storeId } = useMockSession()
  const [formState, setFormState] = useState<BrandFormState>(emptyFormState)
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

  const set = <K extends keyof BrandFormState>(field: K) => (value: BrandFormState[K]) => {
    setFormState((s) => ({ ...s, [field]: value }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleChange = (field: keyof BrandFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormState((s) => ({ ...s, [field]: event.target.value }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId)
    if (!preset) {
      set('themePreset')('')
      return
    }
    setFormState((s) => ({
      ...s,
      themePreset: presetId,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      buttonStyle: preset.buttonStyle,
      cardStyle: preset.cardStyle,
    }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    await updateStoreTheme(storeId, {
      logoUrl: formState.logoUrl.trim() || undefined,
      coverUrl: formState.coverUrl.trim() || undefined,
      slogan: formState.slogan.trim() || undefined,
      shortDescription: formState.shortDescription.trim() || undefined,
      primaryColor: formState.primaryColor.trim() || undefined,
      secondaryColor: formState.secondaryColor.trim() || undefined,
      accentColor: formState.accentColor.trim() || undefined,
      themePreset: formState.themePreset || undefined,
      buttonStyle: formState.buttonStyle,
      cardStyle: formState.cardStyle,
      productLayout: formState.productLayout,
      navigationStyle: formState.navigationStyle,
      heroStyle: formState.heroStyle,
      showHero: formState.showHero,
      showLoyaltyBlock: formState.showLoyaltyBlock,
      showPromotionsSection: formState.showPromotionsSection,
      showBestSellersSection: formState.showBestSellersSection,
      showWhatsappFloat: formState.showWhatsappFloat,
    })

    setSuccessMessage('Visual da loja salvo com sucesso. A vitrine pública já reflete as alterações.')
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Minha marca"
        icon="palette"
        title="Identidade e visual da loja"
        description="Personalize a aparência da sua vitrine e fortaleça o reconhecimento da marca."
      />

      <form className="stack-lg" onSubmit={handleSubmit}>
        {/* Preset Selector */}
        <Card title="Preset visual" subtitle="Escolha um tema pronto como ponto de partida" variant="layered">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {THEME_PRESETS.map((preset) => {
              const isActive = formState.themePreset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  style={{
                    border: `2px solid ${isActive ? preset.accentColor : 'var(--border-soft)'}`,
                    borderRadius: '14px',
                    padding: '0.85rem 0.7rem',
                    cursor: 'pointer',
                    background: isActive ? `linear-gradient(135deg, ${preset.primaryColor}15, ${preset.accentColor}10)` : 'var(--surface)',
                    transition: '0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {[preset.primaryColor, preset.accentColor, preset.secondaryColor].map((color, i) => (
                      <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? preset.primaryColor : 'var(--text-secondary)' }}>
                    {preset.emoji} {preset.label}
                  </span>
                </button>
              )
            })}
          </div>
          {formState.themePreset && (
            <button
              type="button"
              onClick={() => set('themePreset')('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0, textDecoration: 'underline' }}
            >
              Remover preset (usar cores personalizadas)
            </button>
          )}
        </Card>

        {/* Identity */}
        <Card title="Identidade da loja" subtitle="Logo, banner, slogan e descrição" variant="layered">
          <div className="grid grid-3">
            <Input
              id="brand-logo"
              label="Logo (URL da imagem)"
              value={formState.logoUrl}
              onChange={handleChange('logoUrl')}
              placeholder="https://..."
            />
            <Input
              id="brand-cover"
              label="Banner principal (URL da imagem)"
              value={formState.coverUrl}
              onChange={handleChange('coverUrl')}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-3">
            <Input
              id="brand-slogan"
              label="Slogan"
              value={formState.slogan}
              onChange={handleChange('slogan')}
              placeholder="Ex: O melhor café da cidade"
            />
            <Input
              id="brand-short-description"
              label="Descrição curta"
              value={formState.shortDescription}
              onChange={handleChange('shortDescription')}
              placeholder="Ex: Produtos artesanais com amor"
            />
          </div>
          {(formState.logoUrl || formState.coverUrl) && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {formState.logoUrl && (
                <div>
                  <p className="field-label" style={{ marginBottom: '0.3rem' }}>Prévia do logo</p>
                  <img
                    src={formState.logoUrl}
                    alt="Logo prévia"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }}
                    onError={(e) => {
                      const parent = (e.target as HTMLImageElement).parentElement
                      if (parent) parent.style.display = 'none'
                    }}
                  />
                </div>
              )}
              {formState.coverUrl && (
                <div>
                  <p className="field-label" style={{ marginBottom: '0.3rem' }}>Prévia do banner</p>
                  <img
                    src={formState.coverUrl}
                    alt="Banner prévia"
                    style={{ height: '60px', maxWidth: '240px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }}
                    onError={(e) => {
                      const parent = (e.target as HTMLImageElement).parentElement
                      if (parent) parent.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Colors */}
        <Card title="Paleta de cores" subtitle="Cores principais da vitrine" variant="layered">
          <div className="grid grid-3">
            <ColorField id="brand-primary" label="Cor principal" value={formState.primaryColor} onChange={set('primaryColor')} />
            <ColorField id="brand-secondary" label="Cor secundária" value={formState.secondaryColor} onChange={set('secondaryColor')} />
            <ColorField id="brand-accent" label="Cor de destaque" value={formState.accentColor} onChange={set('accentColor')} />
          </div>
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              height: '40px',
              border: '1px solid var(--border-soft)',
            }}
          >
            <div style={{ flex: 1, background: formState.primaryColor }} title="Cor principal" />
            <div style={{ flex: 1, background: formState.secondaryColor }} title="Cor secundária" />
            <div style={{ flex: 1, background: formState.accentColor }} title="Cor de destaque" />
          </div>
        </Card>

        {/* Layout */}
        <Card title="Layout da vitrine" subtitle="Como os produtos e a navegação são exibidos" variant="layered">
          <div className="grid grid-3">
            <Select
              id="brand-button-style"
              label="Estilo dos botões"
              value={formState.buttonStyle}
              onChange={handleChange('buttonStyle')}
            >
              <option value="rounded">Arredondado</option>
              <option value="pill">Pílula</option>
              <option value="square">Quadrado</option>
            </Select>
            <Select
              id="brand-card-style"
              label="Estilo dos cards"
              value={formState.cardStyle}
              onChange={handleChange('cardStyle')}
            >
              <option value="elevated">Elevado (sombra)</option>
              <option value="flat">Plano</option>
              <option value="outlined">Contornado</option>
              <option value="glass">Vidro</option>
            </Select>
            <Select
              id="brand-hero-style"
              label="Estilo do hero"
              value={formState.heroStyle}
              onChange={handleChange('heroStyle')}
            >
              <option value="cover">Capa com banner</option>
              <option value="minimal">Minimalista</option>
              <option value="centered">Centralizado</option>
            </Select>
          </div>
          <div className="grid grid-3">
            <Select
              id="brand-product-layout"
              label="Layout dos produtos"
              value={formState.productLayout}
              onChange={handleChange('productLayout')}
            >
              <option value="grid-2">Grade 2 colunas</option>
              <option value="list">Lista</option>
              <option value="cards-wide">Cards largos</option>
            </Select>
            <Select
              id="brand-nav-style"
              label="Estilo de navegação"
              value={formState.navigationStyle}
              onChange={handleChange('navigationStyle')}
            >
              <option value="chips">Chips horizontais</option>
              <option value="simple">Menu simples</option>
              <option value="highlighted">Menu com destaque</option>
            </Select>
          </div>
        </Card>


        <Card title="Estúdio visual (prévia ao vivo)" subtitle="Veja como seu tema aparece na vitrine" variant="layered">
          <p className="muted" style={{ marginTop: 0 }}>Os presets definem uma base pronta de cores e estilo. Você pode ajustar cada detalhe para deixar sua vitrine única.</p>
          <div style={{ border: '1px solid var(--border-soft)', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '1rem', background: `linear-gradient(135deg, ${formState.primaryColor} 0%, ${formState.accentColor} 100%)`, color: '#fff' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{formState.slogan || 'Sua vitrine premium'}</p>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.85rem' }}>{formState.shortDescription || 'Prévia do hero e da identidade da loja.'}</p>
            </div>
            <div style={{ padding: '0.9rem', display: 'grid', gap: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {['Início', 'Produtos', 'Promoções'].map((item, i) => (
                  <span key={item} style={{ padding: '0.35rem 0.65rem', borderRadius: formState.navigationStyle === 'simple' ? '8px' : '999px', background: i === 0 ? formState.primaryColor : 'var(--surface-alt)', color: i === 0 ? '#fff' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700 }}>{item}</span>
                ))}
              </div>
              <div style={{ borderRadius: formState.cardStyle === 'glass' ? '18px' : '14px', border: '1px solid var(--border-soft)', padding: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: 700 }}>Card de produto</p>
                <p className="muted" style={{ margin: '0.2rem 0 0.5rem' }}>Layout: {formState.productLayout}</p>
                <button type="button" style={{ border: 'none', background: formState.primaryColor, color: '#fff', borderRadius: formState.buttonStyle === 'pill' ? '999px' : formState.buttonStyle === 'square' ? '8px' : '14px', padding: '0.45rem 0.8rem', fontWeight: 700 }}>Botão principal</button>
              </div>
            </div>
          </div>
        </Card>

        {/* Section toggles */}
        <Card title="Seções visíveis" subtitle="Escolha quais blocos aparecem na sua vitrine" variant="layered">
          <div className="stack" style={{ gap: '0.5rem' }}>
            <ToggleField
              id="toggle-hero"
              label="Hero principal"
              description="Banner de capa com logo e nome da loja"
              checked={formState.showHero}
              onChange={set('showHero')}
            />
            <ToggleField
              id="toggle-loyalty"
              label="Bloco de fidelização"
              description="Botões para seguir loja e receber promoções"
              checked={formState.showLoyaltyBlock}
              onChange={set('showLoyaltyBlock')}
            />
            <ToggleField
              id="toggle-promotions"
              label="Seção de promoções"
              description="Banners de promoções ativas no topo"
              checked={formState.showPromotionsSection}
              onChange={set('showPromotionsSection')}
            />
            <ToggleField
              id="toggle-bestsellers"
              label="Seção mais vendidos"
              description="Destaque dos produtos mais populares"
              checked={formState.showBestSellersSection}
              onChange={set('showBestSellersSection')}
            />
            <ToggleField
              id="toggle-whatsapp"
              label="Botão WhatsApp flutuante"
              description="Botão fixo para contato via WhatsApp"
              checked={formState.showWhatsappFloat}
              onChange={set('showWhatsappFloat')}
            />
          </div>
        </Card>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {successMessage && (
          <p style={{ margin: 0, color: 'var(--success)', fontWeight: 600 }}>{successMessage}</p>
        )}

        <div className="inline-info">
          <Button type="submit" variant="accent">Salvar visual da loja</Button>
        </div>
      </form>
    </section>
  )
}
