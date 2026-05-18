import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  clearPendingStoreInvite,
  getCustomerStoreLinks,
  getFollowedStores,
  getOrdersByStoreForCustomer,
  getPendingStoreInvite,
  getStoreById,
  linkCustomerToStoreFromInvite,
  removeCustomerStoreLink,
  unfollowStore,
  upsertCustomerStoreLink,
} from '../../services/mockData'
import type { CustomerStoreLink, PendingStoreInvite } from '../../services/mockData'

const SOURCE_LABEL: Record<CustomerStoreLink['source'], string> = {
  invite_link: 'Convite',
  qr_code: 'QR Code',
  manual: 'Manual',
  follow: 'Salva',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

export function CustomerMyStoresPage() {
  const navigate = useNavigate()
  const [links, setLinks] = useState<CustomerStoreLink[]>(() => getCustomerStoreLinks())
  const [pendingInvite, setPendingInvite] = useState<PendingStoreInvite | null>(() => getPendingStoreInvite())
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({})
  const [infoMessage, setInfoMessage] = useState('')

  function reloadLinks() {
    const storedLinks = getCustomerStoreLinks()
    setLinks(storedLinks)
    return storedLinks
  }

  useEffect(() => {
    // Merge followed stores into links (compatibility) and load order counts
    void (async () => {
      const initialLinks = getCustomerStoreLinks()
      const followedIds = await getFollowedStores()
      const missingIds = followedIds.filter((id) => !initialLinks.some((l) => l.storeId === id))
      if (missingIds.length > 0) {
        const stores = await Promise.all(missingIds.map((id) => getStoreById(id)))
        const now = new Date().toISOString()
        for (const store of stores) {
          if (!store) continue
          upsertCustomerStoreLink({
            storeId: store.id,
            slug: store.slug,
            storeName: store.name,
            logoUrl: store.logoUrl,
            source: 'follow',
            lastAccessedAt: now,
            isActive: true,
          })
        }
        setLinks(getCustomerStoreLinks())
      }

      // Load order counts
      const allLinks = getCustomerStoreLinks()
      const counts: Record<string, number> = {}
      await Promise.all(
        allLinks.map(async (link) => {
          const orders = await getOrdersByStoreForCustomer(link.storeId)
          counts[link.storeId] = orders.length
        }),
      )
      setOrderCounts(counts)
    })()
  }, [])

  const handleAcceptInvite = () => {
    if (!pendingInvite) return
    linkCustomerToStoreFromInvite(pendingInvite)
    clearPendingStoreInvite()
    setPendingInvite(null)
    reloadLinks()
    navigate(`/loja/${pendingInvite.slug}`)
  }

  const handleRemoveInvite = () => {
    clearPendingStoreInvite()
    setPendingInvite(null)
  }

  const handleRemoveLink = async (link: CustomerStoreLink) => {
    removeCustomerStoreLink(link.storeId)
    if (link.source === 'follow') {
      await unfollowStore(link.storeId)
    }
    reloadLinks()
    setInfoMessage(`Loja ${link.storeName} removida.`)
  }

  const sortedLinks = [...links].sort(
    (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime(),
  )

  const hasPendingInvite = Boolean(pendingInvite)
  const hasLinks = sortedLinks.length > 0
  const isEmpty = !hasPendingInvite && !hasLinks

  return (
    <section className="stack-xl">
      <PageHeader
        kicker="Minhas lojas"
        icon="storefront"
        title="Minhas lojas"
        description="Lojas que você recebeu, salvou ou acessou pelo HubMascate."
      />

      {/* Convite pendente */}
      {hasPendingInvite && pendingInvite && (
        <Card title="Convite pendente" subtitle={pendingInvite.storeName} variant="layered">
          <p className="muted">Você recebeu um convite para esta loja. Aceite para adicioná-la às suas lojas.</p>
          <div className="inline-info">
            <Button variant="accent" onClick={handleAcceptInvite}>
              Aceitar e abrir
            </Button>
            <Button variant="ghost" onClick={handleRemoveInvite}>
              Remover convite
            </Button>
          </div>
        </Card>
      )}

      {/* Lojas vinculadas */}
      {hasLinks && (
        <div className="grid">
          {sortedLinks.map((link) => (
            <Card
              key={link.storeId}
              title={link.storeName}
              subtitle={SOURCE_LABEL[link.source]}
              variant="accentCorner"
            >
              <p className="muted">Último acesso: {formatDate(link.lastAccessedAt)}</p>
              <div className="inline-info">
                <Link to={`/loja/${link.slug}`}>
                  <Button variant="accent">Abrir</Button>
                </Link>
                <Link to={`/cliente/pedidos?loja=${link.storeId}`}>
                  <Button variant="secondary">
                    Pedidos{orderCounts[link.storeId] ? ` (${orderCounts[link.storeId]})` : ''}
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => { void handleRemoveLink(link) }}>
                  Remover
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <Card
          title="Nenhuma loja salva"
          subtitle="Abra o link ou QR Code enviado por uma loja."
          variant="default"
        >
          <div className="inline-info">
            <Button variant="primary" onClick={() => navigate('/cliente')}>
              Início
            </Button>
          </div>
        </Card>
      )}

      {infoMessage && <p className="muted">{infoMessage}</p>}
    </section>
  )
}

