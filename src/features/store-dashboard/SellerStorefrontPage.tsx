import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { PageHeader } from '../../components/ui/PageHeader'
import { RealQrCode } from '../../components/ui/RealQrCode'
import { downloadQrCode } from '../../utils/qrCodeUtils'
import { useMockSession } from '../../hooks/useMockSession'
import { getPublicStorefront, getSellerOnboardingStatus, getStoreById } from '../../services/mockData'
import type { SellerOnboardingStatus } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Store } from '../../types'
import { buildPublicUrl } from '../../utils/publicUrl'

function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function SellerStorefrontPage() {
  const { storeId } = useMockSession()
  const [store, setStore] = useState<Store | undefined>()
  const [onboardingStatus, setOnboardingStatus] = useState<SellerOnboardingStatus | null>(null)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const found = await getStoreById(storeId)
      if (cancelled || !found?.slug) return
      const [storefront, status] = await Promise.all([
        getPublicStorefront(found.slug),
        getSellerOnboardingStatus(storeId),
      ])
      if (!cancelled) {
        setStore(storefront)
        setOnboardingStatus(status)
      }
    }

    load()
    return () => { cancelled = true }
  }, [storeId])

  const storefrontPath = store?.slug ? `/loja/${store.slug}` : null
  const storefrontUrl = storefrontPath ? buildPublicUrl(storefrontPath) : null
  const storeTheme = getStoreTheme(store)

  const handleCopyLink = async () => {
    if (!storefrontUrl) return
    try {
      setCopyMessage('')
      await window.navigator.clipboard.writeText(storefrontUrl)
      setCopyMessage('Link copiado! Compartilhe com seus clientes.')
    } catch (error) {
      console.warn('Falha ao copiar link da vitrine:', error)
      setCopyMessage('Não foi possível copiar automaticamente. Copie o link acima manualmente.')
    }
  }

  const handleDownloadQr = () => {
    if (!storefrontUrl) return
    const filename = store?.slug ? `qrcode-${store.slug}.png` : 'qrcode-vitrine.png'
    downloadQrCode(storefrontUrl, filename)
  }

  const msgConvite = store && storefrontUrl
    ? `Olá! Conheça minha vitrine digital da ${store.name}: ${storefrontUrl}`
    : ''

  const msgPromocao = store && storefrontUrl
    ? `Tem novidade na ${store.name}! Acesse a vitrine e confira produtos, ofertas e formas de pedido: ${storefrontUrl}`
    : ''

  const msgCliente = store && storefrontUrl
    ? `Olá! Separei o link da minha loja para você comprar de forma mais fácil quando precisar: ${storefrontUrl}`
    : ''

  const msgPrincipal = store && storefrontUrl
    ? [
        `Olá! Agora você pode acessar minha vitrine digital da ${store.name}, ver produtos e fazer pedidos pelo link: ${storefrontUrl}`,
        store.slogan ? store.slogan : null,
      ]
        .filter(Boolean)
        .join(' — ')
    : ''

  const isReady = onboardingStatus?.isReadyToShare ?? false

  return (
    <section className="stack-xl">
      <PageHeader
        kicker="Minha vitrine"
        icon="storefront"
        title="Central de compartilhamento"
        description="Compartilhe sua vitrine com clientes pelo WhatsApp, QR Code ou link direto."
      />

      {/* Onboarding status banner */}
      {onboardingStatus !== null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: isReady ? 'var(--color-success-soft, #ecfdf5)' : 'var(--color-warning-soft, #fffbeb)',
            border: `1px solid ${isReady ? 'var(--color-success, #10b981)' : 'var(--color-warning, #f59e0b)'}`,
          }}
        >
          <Icon name={isReady ? 'check' : 'clock'} className="icon-sm" />
          {isReady ? (
            <span style={{ fontWeight: 600, color: 'var(--color-success, #047857)' }}>
              Pronta para compartilhar ✓
            </span>
          ) : (
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Sua vitrine já pode ser compartilhada, mas ainda faltam etapas para vender melhor.{' '}
              <Link to="/lojista" style={{ fontWeight: 600, textDecoration: 'underline' }}>
                Concluir checklist
              </Link>
            </span>
          )}
        </div>
      )}

      <div className="grid">
        {/* Link oficial */}
        <Card
          title="Link oficial da vitrine"
          subtitle="Este é o endereço que você envia para seus clientes."
          variant="accentCorner"
          accentColor={storeTheme.accentColor}
        >
          <div className="stack" style={{ gap: '1rem' }}>
            {storefrontUrl ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  padding: '0.6rem 0.9rem',
                }}
              >
                <Icon name="storefront" className="icon-sm" />
                <code style={{ flex: 1, wordBreak: 'break-all', fontSize: '0.875rem' }}>{storefrontUrl}</code>
              </div>
            ) : (
              <p className="muted">Carregando link da vitrine…</p>
            )}

            <p className="muted storefront-note">
              Este é o link oficial que você envia para seus clientes.
            </p>

            <div className="inline-info">
              <Button variant="secondary" onClick={handleCopyLink} disabled={!storefrontUrl}>
                <Icon name="check" className="icon-sm" />
                Copiar link
              </Button>
              {storefrontPath && (
                <Link to={storefrontPath} target="_blank" rel="noopener noreferrer">
                  <Button variant="store" storeColor={storeTheme.primaryColor}>
                    <Icon name="arrowRight" className="icon-sm" />
                    Abrir vitrine
                  </Button>
                </Link>
              )}
              {storefrontPath && (
                <Link to={storefrontPath}>
                  <Button variant="ghost">
                    <Icon name="user" className="icon-sm" />
                    Simular cliente
                  </Button>
                </Link>
              )}
            </div>

            {copyMessage && (
              <p className="muted" style={{ color: 'var(--color-success, #047857)', fontWeight: 500 }}>
                {copyMessage}
              </p>
            )}
            {storefrontPath && (
              <p className="muted storefront-note" style={{ fontSize: '0.78rem' }}>
                Ao usar "Simular cliente", esta loja será salva como loja ativa na área do cliente.
              </p>
            )}
          </div>
        </Card>

        {/* QR Code real */}
        <Card
          title="QR Code da vitrine"
          subtitle="Imprima no balcão, embalagem ou cartão de visita."
          variant="layered"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.875rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border)',
                display: 'inline-block',
              }}
            >
              {storefrontUrl ? (
                <RealQrCode
                  value={storefrontUrl}
                  size={160}
                  label={`QR Code da vitrine ${store?.name ?? ''}`}
                />
              ) : (
                <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Carregando…</p>
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={handleDownloadQr}
              disabled={!storefrontUrl}
            >
              <Icon name="arrowRight" className="icon-sm" />
              Baixar QR Code (PNG)
            </Button>
            <p className="muted" style={{ fontSize: '0.78rem', textAlign: 'center' }}>
              Escaneie com a câmera do celular para abrir a vitrine.
            </p>
          </div>
        </Card>

        {/* Prévia da loja */}
        <Card
          title="Prévia da loja"
          subtitle="Como os clientes veem sua vitrine"
          variant="accentCorner"
          accentColor={storeTheme.primaryColor}
        >
          {store ? (
            <div className="stack" style={{ gap: '0.75rem' }}>
              <article
                className="store-hero"
                style={{
                  backgroundImage: `linear-gradient(140deg, ${storeTheme.primaryColor}33 0%, ${storeTheme.accentColor}22 100%), url(${storeTheme.coverUrl})`,
                  minHeight: '130px',
                }}
              >
                <div className="store-hero-content">
                  {storeTheme.logoUrl && (
                    <img
                      src={storeTheme.logoUrl}
                      alt={`Logo da loja ${store.name}`}
                      className="store-hero-logo"
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{store.name}</h3>
                    {store.slogan && (
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.85 }}>
                        {store.slogan}
                      </p>
                    )}
                    {!store.slogan && store.description && (
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
                        {store.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={store.isActive ? 'success' : 'muted'}>
                    {store.isActive ? 'Aberta' : 'Pausada'}
                  </Badge>
                </div>
              </article>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="muted" style={{ fontSize: '0.8rem' }}>
                  {store.category} · {store.city}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: storeTheme.accentColor,
                    border: '1px solid var(--color-border)',
                    flexShrink: 0,
                  }}
                  title={`Cor de destaque: ${storeTheme.accentColor}`}
                />
              </div>
              {storefrontPath && (
                <Link to={storefrontPath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="store"
                    storeColor={storeTheme.primaryColor}
                    size="sm"
                    style={{ width: '100%' }}
                  >
                    Ver produtos na vitrine →
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <p className="muted">Carregando prévia…</p>
          )}
        </Card>

        {/* Modelos de mensagem WhatsApp */}
        {storefrontUrl && store && (
          <Card
            title="Compartilhar pelo WhatsApp"
            subtitle="Escolha uma mensagem pronta para enviar aos clientes."
            variant="layered"
          >
            <div className="stack" style={{ gap: '0.75rem' }}>
              <div
                style={{
                  display: 'grid',
                  gap: '0.625rem',
                }}
              >
                <a
                  href={buildWhatsAppUrl(msgPrincipal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="accent" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
                    <Icon name="check" className="icon-sm" />
                    Mensagem principal
                  </Button>
                </a>
                <a
                  href={buildWhatsAppUrl(msgConvite)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
                    <Icon name="user" className="icon-sm" />
                    Convite simples
                  </Button>
                </a>
                <a
                  href={buildWhatsAppUrl(msgPromocao)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
                    <Icon name="storefront" className="icon-sm" />
                    Promoção / Novidade
                  </Button>
                </a>
                <a
                  href={buildWhatsAppUrl(msgCliente)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="ghost" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
                    <Icon name="arrowRight" className="icon-sm" />
                    Cliente recorrente
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* Como divulgar */}
        <Card
          title="Como divulgar sua vitrine"
          subtitle="Dicas práticas para atrair os primeiros clientes"
          variant="layered"
        >
          <ul
            style={{
              margin: 0,
              padding: '0 0 0 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            <li>Envie o link para clientes pelo WhatsApp.</li>
            <li>Mostre o QR Code no balcão, embalagem ou cartão de visita.</li>
            <li>Publique o link na bio do Instagram.</li>
            <li>Use promoções e cupons para incentivar o primeiro pedido.</li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
