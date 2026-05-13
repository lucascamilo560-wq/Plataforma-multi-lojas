import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  followStore,
  getFollowedStores,
  getInvitedStoreSlug,
  getLastVisitedStoreSlug,
  getOrdersByStoreForCustomer,
  getStoreById,
  getStoreBySlug,
  unfollowStore,
} from '../../services/mockData'
import type { Store } from '../../types'

export function CustomerMyStoresPage() {
  const [followedStores, setFollowedStores] = useState<Store[]>([])
  const [followedStoreIds, setFollowedStoreIds] = useState<string[]>([])
  const [lastVisitedStore, setLastVisitedStore] = useState<Store | undefined>()
  const [invitedStore, setInvitedStore] = useState<Store | undefined>()
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({})
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    async function loadStores() {
      const [followedIds, lastVisitedSlug, invitedSlug] = await Promise.all([
        getFollowedStores(),
        getLastVisitedStoreSlug(),
        getInvitedStoreSlug(),
      ])

      const [stores, lastStore, invited] = await Promise.all([
        Promise.all(followedIds.map((storeId) => getStoreById(storeId))),
        lastVisitedSlug ? getStoreBySlug(lastVisitedSlug) : Promise.resolve(undefined),
        invitedSlug ? getStoreBySlug(invitedSlug) : Promise.resolve(undefined),
      ])

      const validStores = stores.filter((store): store is Store => Boolean(store))
      setFollowedStores(validStores)
      setFollowedStoreIds(followedIds)
      setLastVisitedStore(lastStore)
      setInvitedStore(invited)

      // Carregar contagem de pedidos para cada loja
      const allStoreIds = Array.from(
        new Set([
          ...followedIds,
          ...(lastStore ? [lastStore.id] : []),
          ...(invited ? [invited.id] : []),
        ]),
      )
      const counts: Record<string, number> = {}
      await Promise.all(
        allStoreIds.map(async (storeId) => {
          const orders = await getOrdersByStoreForCustomer(storeId)
          counts[storeId] = orders.length
        }),
      )
      setOrderCounts(counts)
    }

    loadStores()
  }, [])

  const hasStores = followedStores.length > 0 || Boolean(lastVisitedStore) || Boolean(invitedStore)
  const showInvitedStoreCard = invitedStore && invitedStore.slug !== lastVisitedStore?.slug
  const followedStoreIdsSet = useMemo(() => new Set(followedStoreIds), [followedStoreIds])

  const handleFollowStore = async (store: Store) => {
    await followStore(store.id)
    setFollowedStoreIds((currentIds) => (currentIds.includes(store.id) ? currentIds : [...currentIds, store.id]))
    setFollowedStores((currentStores) => (currentStores.some((item) => item.id === store.id) ? currentStores : [...currentStores, store]))
    setInfoMessage(`Agora você segue a loja ${store.name}.`)
  }

  const handleUnfollowStore = async (store: Store) => {
    await unfollowStore(store.id)
    setFollowedStoreIds((currentIds) => currentIds.filter((id) => id !== store.id))
    setFollowedStores((currentStores) => currentStores.filter((s) => s.id !== store.id))
    setInfoMessage(`Você deixou de seguir ${store.name}.`)
  }

  return (
    <section className="stack-xl">
      <PageHeader
        kicker="Minhas lojas"
        icon="storefront"
        title="Lojas visitadas e salvas"
        description="As lojas acessadas por /loja/:slug aparecem aqui mesmo antes de você clicar em seguir."
      />

      {lastVisitedStore && (
        <Card title="Última loja acessada" subtitle={lastVisitedStore.name} variant="layered">
          <p className="muted">{lastVisitedStore.description}</p>
          <div className="inline-info">
            <Link to={`/loja/${lastVisitedStore.slug}`}>
              <Button variant="accent">Abrir loja</Button>
            </Link>
            <Link to={`/cliente/pedidos?loja=${lastVisitedStore.id}`}>
              <Button variant="secondary">
                Ver pedidos{orderCounts[lastVisitedStore.id] ? ` (${orderCounts[lastVisitedStore.id]})` : ''}
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => { void handleFollowStore(lastVisitedStore) }}
              disabled={followedStoreIdsSet.has(lastVisitedStore.id)}
            >
              {followedStoreIdsSet.has(lastVisitedStore.id) ? 'Loja seguida' : 'Seguir loja'}
            </Button>
          </div>
        </Card>
      )}

      {showInvitedStoreCard && invitedStore && (
        <Card title="Loja convidada por link" subtitle={invitedStore.name} variant="layered">
          <p className="muted">{invitedStore.description}</p>
          <div className="inline-info">
            <Link to={`/loja/${invitedStore.slug}`}>
              <Button variant="accent">Abrir loja</Button>
            </Link>
            <Link to={`/cliente/pedidos?loja=${invitedStore.id}`}>
              <Button variant="secondary">
                Ver pedidos{orderCounts[invitedStore.id] ? ` (${orderCounts[invitedStore.id]})` : ''}
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => { void handleFollowStore(invitedStore) }}
              disabled={followedStoreIdsSet.has(invitedStore.id)}
            >
              {followedStoreIdsSet.has(invitedStore.id) ? 'Loja seguida' : 'Seguir loja'}
            </Button>
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
                <Link to={`/cliente/pedidos?loja=${store.id}`}>
                  <Button variant="ghost">
                    Ver pedidos{orderCounts[store.id] ? ` (${orderCounts[store.id]})` : ''}
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => { void handleUnfollowStore(store) }}>
                  Deixar de seguir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!hasStores && (
        <Card
          title="Nenhuma loja por aqui ainda"
          subtitle="Acesse o link de um lojista em /loja/:slug para salvar uma loja e começar sua experiência."
          variant="default"
        >
          <p className="muted">Você verá a última loja acessada e o convite mais recente mesmo antes de seguir uma loja.</p>
        </Card>
      )}

      {infoMessage && <p className="muted">{infoMessage}</p>}
    </section>
  )
}

