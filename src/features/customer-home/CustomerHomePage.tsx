import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { SectionHeader } from '../../components/ui/SectionHeader'
import {
  getFollowedStores,
  getLastVisitedStoreSlug,
  getProductsByStore,
  getStoreById,
  getStoreBySlug,
  getStoreOrders,
} from '../../services/mockData'
import type { Order, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function CustomerHomePage() {
  const [followedStores, setFollowedStores] = useState<Store[]>([])
  const [lastVisitedStore, setLastVisitedStore] = useState<Store | undefined>()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [followedOffers, setFollowedOffers] = useState<Product[]>([])

  useEffect(() => {
    async function loadHome() {
      const [followedStoreIds, lastVisitedSlug] = await Promise.all([getFollowedStores(), getLastVisitedStoreSlug()])

      const stores = (
        await Promise.all(followedStoreIds.map((storeId) => getStoreById(storeId)))
      ).filter((store): store is Store => Boolean(store))

      const [lastStore, ordersByStore, productsByStore] = await Promise.all([
        lastVisitedSlug ? getStoreBySlug(lastVisitedSlug) : Promise.resolve(undefined),
        Promise.all(stores.map((store) => getStoreOrders(store.id))),
        Promise.all(stores.map((store) => getProductsByStore(store.id))),
      ])

      setLastVisitedStore(lastStore)
      setFollowedStores(stores)
      setRecentOrders(
        ordersByStore
          .flat()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4),
      )
      setFollowedOffers(
        productsByStore
          .flat()
          .filter((product) => product.productType === 'external_link' || product.productType === 'affiliate')
          .slice(0, 4),
      )
    }

    loadHome()
  }, [])

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Suas lojas"
        icon="sparkles"
        title="Continue comprando nas lojas que você segue"
        description="Sua experiência é focada em lojas visitadas por link do lojista, não em um shopping geral."
      />

      {lastVisitedStore && (
        <Card variant="layered" title="Última loja acessada" subtitle={lastVisitedStore.name}>
          <p className="muted">{lastVisitedStore.description}</p>
          <div className="inline-info">
            <Link to={`/loja/${lastVisitedStore.slug}`}>
              <Button variant="accent" size="lg">
                <Icon name="arrowRight" className="icon-sm" />
                Abrir loja
              </Button>
            </Link>
            <Link to="/cliente/minhas-lojas">
              <Button variant="secondary">Ver minhas lojas</Button>
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
                <Link to={`/loja/${store.slug}`}>
                  <Button variant="ghost">Ver ofertas</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {recentOrders.length > 0 && (
        <Card variant="default" title="Pedidos recentes" subtitle="Acompanhe os últimos pedidos das suas lojas">
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
        </Card>
      )}

      {followedOffers.length > 0 && (
        <Card variant="accentCorner" title="Ofertas das lojas seguidas" subtitle="Ofertas externas e campanhas ativas">
          <div className="stack" style={{ gap: '0.6rem' }}>
            {followedOffers.map((product) => (
              <div key={product.id} className="inline-info">
                <span className="muted">{product.name}</span>
                <Link to={`/loja/${followedStores.find((store) => store.id === product.store_id)?.slug ?? ''}`}>
                  <Button variant="ghost" size="md">
                    Ver oferta
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card variant="default" title="Ofertas recomendadas" subtitle="Área mockada de monetização sem SDK">
        <div className="stack" style={{ gap: '0.55rem' }}>
          <p className="muted">Produtos em destaque</p>
          <p className="muted">Publicidade</p>
        </div>
      </Card>

      <Card variant="layered" title="Explorar (secundário)" subtitle="Veja novas lojas quando quiser">
        <div className="inline-info">
          <span className="muted">Sua Home prioriza suas lojas, mas você ainda pode explorar outras vitrines.</span>
          <Link to="/cliente/explorar">
            <Button variant="accent" size="lg">
              <Icon name="arrowRight" className="icon-sm" />
              Explorar lojas
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  )
}
