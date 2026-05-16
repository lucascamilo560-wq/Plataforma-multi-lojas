import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
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
    setInfoMessage(`Promoções de ${activeStore.name} ativadas.`)
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
        {/* Active store compact hero */}
        <article
          className="store-hero"
          style={{
            backgroundImage: `linear-gradient(140deg, ${theme.primaryColor}33 0%, ${theme.accentColor}22 100%), url(${theme.coverUrl})`,
          }}
        >
          <div className="store-hero-content">
            <img src={theme.logoUrl} alt={`Logo ${activeStore.name}`} className="store-hero-logo" />
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>
                {activeStore.name}
              </h2>
              <span style={{ marginTop: '0.3rem' }}>
                <Badge variant={activeStore.isActive ? 'success' : 'muted'}>
                  {activeStore.isActive ? 'Aberta' : 'Em breve'}
                </Badge>
              </span>
            </div>
          </div>
        </article>

        {/* Quick actions */}
        <Card variant="layered">
          <div className="ch-actions">
            <Link to={`/loja/${activeStore.slug}`}>
              <Button variant="accent">
                <Icon name="storefront" className="icon-sm" />
                Abrir loja
              </Button>
            </Link>
            <Link to={`/loja/${activeStore.slug}?tab=ofertas`}>
              <Button variant="secondary">Ver ofertas</Button>
            </Link>
            <Link to={`/loja/${activeStore.slug}/carrinho`}>
              <Button variant="secondary">Carrinho</Button>
            </Link>
            <Link to="/cliente/pedidos">
              <Button variant="secondary">Meus pedidos</Button>
            </Link>
            <Button variant="ghost" onClick={handleReceivePromotions} disabled={isActiveStoreFollowed}>
              {isActiveStoreFollowed ? 'Promoções ativas' : 'Receber promoções'}
            </Button>
          </div>
          {infoMessage && <p className="muted">{infoMessage}</p>}
        </Card>

        {/* Products */}
        {activeStoreProducts.length > 0 && (
          <Card variant="accentCorner" title="Produtos">
            <div className="stack" style={{ gap: '0.6rem' }}>
              {activeStoreProducts.map((product) => (
                <div key={product.id} className="inline-info">
                  <span>{product.name}</span>
                  <span className="ch-row-right">
                    <strong>{formatCurrency(product.price)}</strong>
                    <Link to={`/loja/${activeStore.slug}`}>
                      <Button variant="ghost" size="md">Ver</Button>
                    </Link>
                  </span>
                </div>
              ))}
            </div>
            <Link to={`/loja/${activeStore.slug}`}>
              <Button variant="ghost">Ver todos</Button>
            </Link>
          </Card>
        )}

        {/* Offers */}
        {activeStoreOffers.length > 0 && (
          <Card variant="accentCorner" title="Ofertas">
            <div className="stack" style={{ gap: '0.6rem' }}>
              {activeStoreOffers.map((product) => (
                <div key={product.id} className="inline-info">
                  <span>{product.name}</span>
                  <Link to={`/loja/${activeStore.slug}?tab=ofertas`}>
                    <Button variant="ghost" size="md">Abrir</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent orders */}
        <Card variant="default" title="Pedidos recentes">
          {recentOrders.length === 0 ? (
            <p className="muted">Nenhum pedido recente.</p>
          ) : (
            <>
              <div className="stack" style={{ gap: '0.6rem' }}>
                {recentOrders.map((order) => (
                  <div key={order.id} className="inline-info">
                    <span className="muted">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                    <Badge variant={order.status === 'delivered' ? 'success' : 'muted'}>{order.status}</Badge>
                  </span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                ))}
              </div>
              <Link to="/cliente/pedidos">
                <Button variant="ghost">Ver pedidos</Button>
              </Link>
            </>
          )}
        </Card>
      </section>
    )
  }

  const hasStores = followedStores.length > 0 || Boolean(lastVisitedStore)

  return (
    <section className="stack-xl">
      {/* Open store card */}
      <Card variant="accentCorner">
        <h2 className="card-title" style={{ fontSize: '1.15rem' }}>Abrir uma loja</h2>
        <p className="muted" style={{ margin: 0 }}>Cole o link da loja.</p>
        <div className="ch-link-row">
          <Input
            id="store-link"
            placeholder="Link ou código da loja"
            value={storeLink}
            onChange={(event) => setStoreLink(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') { void handleOpenByLink() } }}
          />
          <Button variant="accent" onClick={() => { void handleOpenByLink() }}>
            Abrir loja
          </Button>
        </div>
        {linkError && <p className="error-text">{linkError}</p>}
        <div className="ch-actions">
          <Link to="/cliente/minhas-lojas">
            <Button variant="secondary">Minhas lojas</Button>
          </Link>
          <Link to="/cliente/pedidos">
            <Button variant="secondary">Meus pedidos</Button>
          </Link>
        </div>
      </Card>

      {/* Last visited store */}
      {lastVisitedStore && (
        <Card variant="layered" title="Última loja acessada" subtitle={`${lastVisitedStore.category} · ${lastVisitedStore.city}`}>
          <div className="inline-info">
            <Link to={`/loja/${lastVisitedStore.slug}`}>
              <Button variant="accent">
                <Icon name="arrowRight" className="icon-sm" />
                Abrir loja
              </Button>
            </Link>
            <Link to="/cliente/minhas-lojas">
              <Button variant="secondary">Minhas lojas</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Followed stores */}
      {followedStores.length > 0 && (
        <div className="grid">
          {followedStores.map((store) => (
            <Card key={store.id} variant="accentCorner" title={store.name} subtitle={`${store.category} · ${store.city}`}>
              <div className="inline-info">
                <Link to={`/loja/${store.slug}`}>
                  <Button variant="store">Abrir</Button>
                </Link>
                <Link to={`/loja/${store.slug}?tab=ofertas`}>
                  <Button variant="ghost">Ofertas</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasStores && (
        <Card variant="default" title="Nenhuma loja salva">
          <p className="muted">Cole um link ou leia o QR da loja.</p>
          <Link to="/cliente/pedidos">
            <Button variant="ghost">Meus pedidos</Button>
          </Link>
        </Card>
      )}
    </section>
  )
}

