import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  getFollowedStores,
  getInvitedStoreSlug,
  getLastVisitedStoreSlug,
  getStoreById,
  getStoreBySlug,
} from '../../services/mockData'
import type { Store } from '../../types'

export function CustomerMyStoresPage() {
  const [followedStores, setFollowedStores] = useState<Store[]>([])
  const [lastVisitedStore, setLastVisitedStore] = useState<Store | undefined>()
  const [invitedStoreSlug, setInvitedStoreSlug] = useState<string | null>(null)

  useEffect(() => {
    async function loadStores() {
      const [followedStoreIds, lastVisitedSlug, invitedSlug] = await Promise.all([
        getFollowedStores(),
        getLastVisitedStoreSlug(),
        getInvitedStoreSlug(),
      ])

      const [stores, lastStore] = await Promise.all([
        Promise.all(followedStoreIds.map((storeId) => getStoreById(storeId))),
        lastVisitedSlug ? getStoreBySlug(lastVisitedSlug) : Promise.resolve(undefined),
      ])

      setFollowedStores(stores.filter((store): store is Store => Boolean(store)))
      setLastVisitedStore(lastStore)
      setInvitedStoreSlug(invitedSlug)
    }

    loadStores()
  }, [])

  const hasStores = followedStores.length > 0 || Boolean(lastVisitedStore)

  return (
    <section className="stack-xl">
      <PageHeader
        kicker="Minhas lojas"
        icon="storefront"
        title="Suas lojas por link"
        description="Veja apenas lojas que você seguiu ou acessou por convite do lojista."
      />

      {lastVisitedStore && (
        <Card title="Última loja acessada" subtitle={lastVisitedStore.name} variant="layered">
          <p className="muted">{lastVisitedStore.description}</p>
          <div className="inline-info">
            <Link to={`/loja/${lastVisitedStore.slug}`}>
              <Button variant="accent">Abrir loja</Button>
            </Link>
            <Link to={`/loja/${lastVisitedStore.slug}`}>
              <Button variant="secondary">Ver ofertas</Button>
            </Link>
          </div>
        </Card>
      )}

      {followedStores.length > 0 && (
        <div className="grid">
          {followedStores.map((store) => (
            <Card key={store.id} title={store.name} subtitle={`${store.category} · ${store.city}`} variant="accentCorner">
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

      {!hasStores && (
        <Card
          title="Nenhuma loja seguida ainda"
          subtitle="Acesse uma loja pelo link do lojista para começar sua experiência personalizada."
          variant="default"
        >
          <p className="muted">
            Assim que você entrar em uma vitrine em /loja/:slug e seguir a loja, ela aparecerá aqui.
          </p>
        </Card>
      )}

      {invitedStoreSlug && (
        <p className="muted">Convite mais recente por link: /loja/{invitedStoreSlug}</p>
      )}
    </section>
  )
}
