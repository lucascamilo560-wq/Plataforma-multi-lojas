import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { MockQrCode } from '../../components/ui/MockQrCode'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getPublicStorefront, getStoreById } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Store } from '../../types'
import { buildPublicUrl } from '../../utils/publicUrl'

export function SellerStorefrontPage() {
  const { storeId } = useMockSession()
  const [store, setStore] = useState<Store | undefined>()
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const found = await getStoreById(storeId)
      if (cancelled || !found?.slug) return
      const storefront = await getPublicStorefront(found.slug)
      if (!cancelled) setStore(storefront)
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

  return (
    <section className="stack-xl">
      <PageHeader
        kicker="Minha vitrine"
        icon="storefront"
        title="Vitrine pública da sua loja"
        description="Este é o link oficial que seus clientes usam para acessar sua loja, ver produtos e fazer pedidos."
      />

      <div className="grid">
        <Card
          title="Link da vitrine"
          subtitle="Compartilhe este endereço com seus clientes"
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

            <div className="inline-info">
              <Button variant="secondary" onClick={handleCopyLink} disabled={!storefrontUrl}>
                <Icon name="check" className="icon-sm" />
                Copiar link público
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
                  <Button variant="accent">
                    <Icon name="user" className="icon-sm" />
                    Simular cliente nesta loja
                  </Button>
                </Link>
              )}
            </div>

            {storefrontUrl && (
              <p className="muted storefront-note">
                Este é o link público correto da sua loja neste ambiente.
              </p>
            )}
            {storefrontPath && (
              <p className="muted storefront-note">
                Ao usar “Simular cliente nesta loja”, esta loja será salva como loja ativa na área do cliente.
              </p>
            )}
            {copyMessage && <p className="muted">{copyMessage}</p>}
          </div>
        </Card>

        <Card
          title="QR Code da loja"
          subtitle="Imprima ou mostre para que clientes acessem diretamente"
          variant="layered"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
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
              <MockQrCode size={140} />
            </div>
            <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
              QR Code representativo — integração com gerador real em breve.
            </p>
          </div>
        </Card>

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
                  minHeight: '120px',
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
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{store.name}</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{store.description}</p>
                  </div>
                  <Badge variant={store.isActive ? 'success' : 'muted'}>
                    {store.isActive ? 'Aberta' : 'Em breve'}
                  </Badge>
                </div>
              </article>
              <p className="muted" style={{ fontSize: '0.8rem' }}>
                Categoria: {store.category} · {store.city}
              </p>
            </div>
          ) : (
            <p className="muted">Carregando prévia…</p>
          )}
        </Card>
      </div>
    </section>
  )
}
