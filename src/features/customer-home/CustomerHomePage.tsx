import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { SectionHeader } from '../../components/ui/SectionHeader'
import {
  followStore,
  getActiveStore,
  getFollowedStores,
  getLastVisitedStoreSlug,
  getProductsByStore,
  getStoreById,
  getStoreBySlug,
  getStoreOrders,
  isStoreFollowed,
} from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function CustomerHomePage() {
  const navigate = useNavigate()
  const [activeStore, setActiveStore] = useState<Store | null>(null)
  const [isActiveStoreFollowed, setIsActiveStoreFollowed] = useState(false)
  const [followedStores, setFollowedStores] = useState<Store[]>([])
  const [lastVisitedStore, setLastVisitedStore] = useState<Store | undefined>()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [activeStoreProducts, setActiveStoreProducts] = useState<Product[]>([])
  const [activeStoreOffers, setActiveStoreOffers] = useState<Product[]>([])
  const [infoMessage, setInfoMessage] = useState('')
  const [storeLink, setStoreLink] = useState('')
  const [linkError, setLinkError] = useState('')

  useEffect(() => {
    async function loadHome() {
      const [currentActiveStore, followedStoreIds, lastVisitedSlug] = await Promise.all([
        getActiveStore(),
        getFollowedStores(),
        getLastVisitedStoreSlug(),
      ])

      const stores = (
        await Promise.all(followedStoreIds.map((storeId) => getStoreById(storeId)))
      ).filter((store): store is Store => Boolean(store))

      const lastStore = lastVisitedSlug ? await getStoreBySlug(lastVisitedSlug) : undefined

      setActiveStore(currentActiveStore)
      setLastVisitedStore(lastStore)
      setFollowedStores(stores)

      if (!currentActiveStore) {
        setRecentOrders([])
        setActiveStoreProducts([])
        setActiveStoreOffers([])
        setIsActiveStoreFollowed(false)
        return
      }

      const [orders, products, followed] = await Promise.all([
        getStoreOrders(currentActiveStore.id),
        getProductsByStore(currentActiveStore.id),
        isStoreFollowed(currentActiveStore.id),
      ])

      setRecentOrders(
        orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4),
      )
      setActiveStoreProducts(products.slice(0, 4))
      setActiveStoreOffers(
        products
          .filter((product) => product.productType === 'external_link' || product.productType === 'affiliate')
          .slice(0, 4),
      )
      setIsActiveStoreFollowed(followed)
    }

    loadHome()
  }, [])

  const handleReceivePromotions = async () => {
    if (!activeStore || isActiveStoreFollowed) {
      return
    }

    await followStore(activeStore.id)
    setIsActiveStoreFollowed(true)
    setInfoMessage(`Você começou a receber promoções da ${activeStore.name}.`)
  }

  const handleOpenByLink = async () => {
    setLinkError('')
    const input = storeLink.trim()

    if (!input) {
      setLinkError('Informe o link ou código da loja.')
      return
    }

    // Extract slug from full URL or path like /loja/slug
    const urlMatch = input.match(/\/loja\/([^/?#]+)/)
    const slug = urlMatch ? urlMatch[1] : input.replace(/^\/+/, '')

    const store = await getStoreBySlug(slug)
    if (!store) {
      setLinkError('Loja não encontrada. Verifique o link enviado pelo lojista.')
      return
    }

    navigate(`/loja/${slug}`)
  }

  if (activeStore) {
    const theme = getStoreTheme(activeStore)

    return (
      <section className="stack-xl">
        <SectionHeader
          kicker="Sua loja salva"
          icon="storefront"
          title={`Continue comprando com ${activeStore.name}`}
          description={`Você está na loja ${activeStore.name}.`}
        />

        <article
          className="store-hero"
          style={{
            backgroundImage: `linear-gradient(140deg, ${theme.primaryColor}33 0%, ${theme.accentColor}22 100%), url(${theme.coverUrl})`,
          }}
        >
          <div className="store-hero-content">
            <img src={theme.logoUrl} alt={`Logo da loja ${activeStore.name}`} className="store-hero-logo" />
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>
                {activeStore.name}
              </h2>
              <p style={{ margin: '0.2rem 0 0' }}>{activeStore.description}</p>
            </div>
            <Badge variant={activeStore.isActive ? 'success' : 'muted'}>
              {activeStore.isActive ? 'Loja aberta para pedidos' : 'Loja em breve'}
            </Badge>
          </div>
        </article>

        <Card variant="layered" title="Ações rápidas" subtitle={`Você está na loja ${activeStore.name}`}>
          <div className="inline-info">
            <Link to={`/loja/${activeStore.slug}`}>
              <Button variant="accent">Abrir loja</Button>
            </Link>
            <Link to={`/loja/${activeStore.slug}?tab=ofertas`}>
              <Button variant="secondary">Ver ofertas</Button>
            </Link>
            <Link to={`/loja/${activeStore.slug}/carrinho`}>
              <Button variant="secondary">Ver carrinho</Button>
            </Link>
            <Button variant="ghost" onClick={handleReceivePromotions} disabled={isActiveStoreFollowed}>
              {isActiveStoreFollowed ? 'Promoções ativas' : 'Receber promoções'}
            </Button>
          </div>
          {infoMessage && <p className="muted">{infoMessage}</p>}
        </Card>

        {activeStoreProducts.length > 0 && (
          <Card variant="accentCorner" title={`Produtos da ${activeStore.name}`} subtitle="Destaques para continuar comprando">
            <div className="stack" style={{ gap: '0.6rem' }}>
              {activeStoreProducts.map((product) => (
                <div key={product.id} className="inline-info">
                  <span className="muted">{product.name}</span>
                  <strong>{formatCurrency(product.price)}</strong>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeStoreOffers.length > 0 && (
          <Card variant="accentCorner" title={`Ofertas da ${activeStore.name}`} subtitle="Campanhas e links ativos da loja">
            <div className="stack" style={{ gap: '0.6rem' }}>
              {activeStoreOffers.map((product) => (
                <div key={product.id} className="inline-info">
                  <span className="muted">{product.name}</span>
                  <Link to={`/loja/${activeStore.slug}?tab=ofertas`}>
                    <Button variant="ghost" size="md">
                      Ver oferta
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card variant="default" title="Pedidos recentes da loja" subtitle={`Histórico recente em ${activeStore.name}`}>
          {recentOrders.length === 0 ? (
            <p className="muted">Você ainda não tem pedidos recentes nesta loja.</p>
          ) : (
            <div className="stack" style={{ gap: '0.6rem' }}>
              {recentOrders.map((order) => (
                <div key={order.id} className="inline-info">
                  <span className="muted">
                    {order.customerName} · {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    )
  }

  const hasStores = followedStores.length > 0 || Boolean(lastVisitedStore)

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Suas lojas"
        icon="sparkles"
        title="Acesse sua loja pelo convite"
        description="Entre pelo link enviado pelo lojista ou escaneie o QR Code da vitrine para começar."
      />

      <Card
        variant="accentCorner"
        title="Abrir loja por link ou código"
        subtitle="Cole o link ou código recebido do lojista"
      >
        <div className="stack" style={{ gap: '0.75rem' }}>
          <div className="inline-info">
            <Input
              id="store-link"
              placeholder="/loja/nome-da-loja ou código da loja"
              value={storeLink}
              onChange={(event) => setStoreLink(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') { void handleOpenByLink() } }}
            />
            <Button variant="accent" onClick={() => { void handleOpenByLink() }}>
              <Icon name="arrowRight" className="icon-sm" />
              Abrir
            </Button>
          </div>
          {linkError && <p className="error-text">{linkError}</p>}
          <p className="muted">Peça ao lojista o link ou QR Code da vitrine para acessar a loja.</p>
        </div>
      </Card>

      {lastVisitedStore && (
        <Card variant="layered" title="Última loja acessada" subtitle={lastVisitedStore.name}>
          <p className="muted">{lastVisitedStore.description}</p>
          <div className="inline-info">
            <Link to={`/loja/${lastVisitedStore.slug}`}>
              <Button variant="accent">
                <Icon name="arrowRight" className="icon-sm" />
                Abrir loja
              </Button>
            </Link>
            <Link to="/cliente/minhas-lojas">
              <Button variant="secondary">Suas lojas salvas</Button>
            </Link>
          </div>
        </Card>
      )}

      {followedStores.length > 0 && (
        <div className="grid">
          {followedStores.map((store) => (
            <Card key={store.id} variant="accentCorner" title={store.name} subtitle={`${store.category} · ${store.city}`}>
              <p className="muted">{store.description}</p>
              <div className="inline-info">
                <Link to={`/loja/${store.slug}`}>
                  <Button variant="store">Abrir loja</Button>
                </Link>
                <Link to={`/loja/${store.slug}?tab=ofertas`}>
                  <Button variant="ghost">Ver ofertas</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!hasStores && (
        <Card
          variant="default"
          title="Você ainda não tem lojas salvas"
          subtitle="Acesse o link enviado por um lojista ou escaneie o QR Code da loja"
        >
          <p className="muted">
            Quando você entrar pelo link de um lojista, a loja ficará salva aqui e sua tela inicial passará a mostrar o contexto dela.
          </p>
        </Card>
      )}
    </section>
  )
}

