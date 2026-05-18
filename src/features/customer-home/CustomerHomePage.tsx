import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import {
  clearPendingStoreInvite,
  getActiveStore,
  getCustomerStoreLinks,
  getOrdersByStoreForCustomer,
  getPendingStoreInvite,
  getProductsByStore,
  getStoreById,
  getStoreBySlug,
  linkCustomerToStoreFromInvite,
} from '../../services/mockData'
import type { CustomerStoreLink, PendingStoreInvite } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const SOURCE_LABEL: Record<CustomerStoreLink['source'], string> = {
  invite_link: 'Convite',
  qr_code: 'QR Code',
  manual: 'Manual',
  follow: 'Salva',
}

export function CustomerHomePage() {
  const navigate = useNavigate()
  const [mainStore, setMainStore] = useState<Store | null>(null)
  const [mainStoreLink, setMainStoreLink] = useState<CustomerStoreLink | null>(null)
  const [pendingInvite, setPendingInvite] = useState<PendingStoreInvite | null>(() => getPendingStoreInvite())
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [mainStoreProducts, setMainStoreProducts] = useState<Product[]>([])
  const [mainStoreOffers, setMainStoreOffers] = useState<Product[]>([])
  const [storeLink, setStoreLink] = useState('')
  const [linkError, setLinkError] = useState('')

  useEffect(() => {
    async function loadHome() {
      // 1. Primary: most recently accessed CustomerStoreLink
      const links = getCustomerStoreLinks()
      const sortedLinks = [...links].sort(
        (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime(),
      )
      const latestLink = sortedLinks[0] ?? null

      let store: Store | null = null
      let usedLink: CustomerStoreLink | null = null

      if (latestLink) {
        const found = await getStoreById(latestLink.storeId)
        if (found) {
          store = found
          usedLink = latestLink
        }
      }

      // 2. Fallback: legacy activeStore
      if (!store) {
        store = await getActiveStore()
      }

      setMainStore(store)
      setMainStoreLink(usedLink)

      if (!store) return

      const [orders, products] = await Promise.all([
        getOrdersByStoreForCustomer(store.id),
        getProductsByStore(store.id),
      ])

      setRecentOrders(orders.slice(0, 4))
      setMainStoreProducts(products.slice(0, 4))
      setMainStoreOffers(
        products
          .filter((p) => p.productType === 'external_link' || p.productType === 'affiliate')
          .slice(0, 4),
      )
    }

    loadHome()
  }, [])

  const handleAcceptInvite = () => {
    if (!pendingInvite) return
    linkCustomerToStoreFromInvite(pendingInvite)
    clearPendingStoreInvite()
    const slug = pendingInvite.slug
    setPendingInvite(null)
    navigate(`/loja/${slug}`)
  }

  const handleRemoveInvite = () => {
    clearPendingStoreInvite()
    setPendingInvite(null)
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

  // --- With main store ---
  if (mainStore) {
    const theme = getStoreTheme(mainStore)

    return (
      <section className="stack-xl">
        {/* Pending invite compact card at top */}
        {pendingInvite && (
          <Card title="Convite pendente" subtitle={pendingInvite.storeName} variant="layered">
            <div className="inline-info">
              <Button variant="accent" onClick={handleAcceptInvite}>
                Aceitar e abrir
              </Button>
              <Button variant="ghost" onClick={handleRemoveInvite}>
                Remover
              </Button>
            </div>
          </Card>
        )}

        {/* Main store hero */}
        <article
          className="store-hero"
          style={{
            backgroundImage: `linear-gradient(140deg, ${theme.primaryColor}33 0%, ${theme.accentColor}22 100%), url(${theme.coverUrl})`,
          }}
        >
          <div className="store-hero-content">
            <img src={theme.logoUrl} alt={`Logo ${mainStore.name}`} className="store-hero-logo" />
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>
                {mainStore.name}
              </h2>
              <span style={{ marginTop: '0.3rem', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge variant={mainStore.isActive ? 'success' : 'muted'}>
                  {mainStore.isActive ? 'Aberta' : 'Em breve'}
                </Badge>
                {mainStoreLink && (
                  <Badge variant="muted">{SOURCE_LABEL[mainStoreLink.source]}</Badge>
                )}
              </span>
            </div>
          </div>
        </article>

        {/* Quick actions */}
        <Card variant="layered">
          <div className="ch-actions">
            <Link to={`/loja/${mainStore.slug}`}>
              <Button variant="accent">
                <Icon name="storefront" className="icon-sm" />
                Continuar
              </Button>
            </Link>
            <Link to={`/loja/${mainStore.slug}?tab=ofertas`}>
              <Button variant="secondary">Ofertas</Button>
            </Link>
            <Link to="/cliente/pedidos">
              <Button variant="secondary">Pedidos</Button>
            </Link>
            <Link to="/cliente/minhas-lojas">
              <Button variant="ghost">Minhas lojas</Button>
            </Link>
          </div>
        </Card>

        {/* Products */}
        {mainStoreProducts.length > 0 && (
          <Card variant="accentCorner" title="Produtos">
            <div className="stack" style={{ gap: '0.6rem' }}>
              {mainStoreProducts.map((product) => (
                <div key={product.id} className="inline-info">
                  <span>{product.name}</span>
                  <span className="ch-row-right">
                    <strong>{formatCurrency(product.price)}</strong>
                    <Link to={`/loja/${mainStore.slug}`}>
                      <Button variant="ghost" size="md">Ver</Button>
                    </Link>
                  </span>
                </div>
              ))}
            </div>
            <Link to={`/loja/${mainStore.slug}`}>
              <Button variant="ghost">Ver todos</Button>
            </Link>
          </Card>
        )}

        {/* Offers */}
        {mainStoreOffers.length > 0 && (
          <Card variant="accentCorner" title="Ofertas">
            <div className="stack" style={{ gap: '0.6rem' }}>
              {mainStoreOffers.map((product) => (
                <div key={product.id} className="inline-info">
                  <span>{product.name}</span>
                  <Link to={`/loja/${mainStore.slug}?tab=ofertas`}>
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

  // --- No main store ---
  return (
    <section className="stack-xl">
      {/* Pending invite */}
      {pendingInvite && (
        <Card title="Convite pendente" subtitle={pendingInvite.storeName} variant="layered">
          <p className="muted">Você recebeu um convite para esta loja.</p>
          <div className="inline-info">
            <Button variant="accent" onClick={handleAcceptInvite}>
              Aceitar e abrir
            </Button>
            <Button variant="ghost" onClick={handleRemoveInvite}>
              Remover
            </Button>
          </div>
        </Card>
      )}

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
    </section>
  )
}

