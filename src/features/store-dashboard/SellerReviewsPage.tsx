import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getReviewsByStore, getStoreById, getStoreReviewSummary } from '../../services/mockData'
import type { StoreReviewSummary } from '../../services/mockData'
import type { Store } from '../../types'
import type { StoreReview } from '../../types'

type FilterOption = 'all' | '5' | '4' | '3' | '1-2' | 'with-comment'

const FILTER_LABELS: Record<FilterOption, string> = {
  all: 'Todas',
  '5': '5 estrelas',
  '4': '4 estrelas',
  '3': '3 estrelas',
  '1-2': '1-2 estrelas',
  'with-comment': 'Com comentário',
}

function StarDisplay({ rating, size = '1.1rem' }: { rating: number; size?: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: '0.1rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ fontSize: size, color: star <= rating ? '#f59e0b' : 'var(--color-border)' }}>
          ★
        </span>
      ))}
    </span>
  )
}

export function SellerReviewsPage() {
  const { storeId } = useMockSession()
  const [store, setStore] = useState<Store | undefined>()
  const [reviews, setReviews] = useState<StoreReview[]>([])
  const [summary, setSummary] = useState<StoreReviewSummary | undefined>()
  const [filter, setFilter] = useState<FilterOption>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStoreById(storeId).then(setStore)
    getReviewsByStore(storeId).then(setReviews)
    getStoreReviewSummary(storeId).then(setSummary)
  }, [storeId])

  const filteredReviews = useMemo(() => {
    let result = reviews

    if (filter === '5') result = result.filter((r) => r.rating === 5)
    else if (filter === '4') result = result.filter((r) => r.rating === 4)
    else if (filter === '3') result = result.filter((r) => r.rating === 3)
    else if (filter === '1-2') result = result.filter((r) => r.rating <= 2)
    else if (filter === 'with-comment') result = result.filter((r) => Boolean(r.comment))

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          (r.comment ?? '').toLowerCase().includes(q),
      )
    }

    return result
  }, [reviews, filter, search])

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Avaliações"
        icon="sparkles"
        title="Central de avaliações"
        description="Veja o que seus clientes estão falando da sua loja."
      />

      {summary && summary.totalReviews > 0 ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-metrics">
            <article className="card card-default" style={{ textAlign: 'center' }}>
              <p className="muted" style={{ margin: '0 0 0.25rem', fontSize: '0.82rem' }}>Média geral</p>
              <p style={{ margin: '0 0 0.25rem', fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
                {summary.averageRating.toFixed(1)}
              </p>
              <StarDisplay rating={Math.round(summary.averageRating)} size="1.2rem" />
            </article>
            <article className="card card-default" style={{ textAlign: 'center' }}>
              <p className="muted" style={{ margin: '0 0 0.25rem', fontSize: '0.82rem' }}>Total de avaliações</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{summary.totalReviews}</p>
            </article>
          </div>

          {/* Rating distribution */}
          <Card title="Distribuição por estrelas" subtitle="" variant="layered">
            <div className="stack" style={{ gap: '0.5rem' }}>
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = summary.ratingCounts[star]
                const percent = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ minWidth: '5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {'★'.repeat(star)} ({count})
                    </span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444',
                          borderRadius: '4px',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span style={{ minWidth: '2.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {percent}%
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      ) : (
        <Card title="Nenhuma avaliação ainda" subtitle="Avaliações aparecem após entregas realizadas" variant="layered">
          <p className="muted">
            Quando um cliente receber o pedido e avaliar, você verá o feedback aqui.
          </p>
        </Card>
      )}

      {reviews.length > 0 && (
        <>
          {/* Search */}
          <div>
            <input
              type="search"
              placeholder="Buscar por cliente ou comentário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-raised, #f9fafb)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(Object.keys(FILTER_LABELS) as FilterOption[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  border: `1px solid ${filter === f ? 'var(--color-accent, #3A86FF)' : 'var(--color-border)'}`,
                  background: filter === f ? 'var(--color-accent, #3A86FF)' : 'transparent',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Reviews list */}
          <div className="stack" style={{ gap: '0.75rem' }}>
            {filteredReviews.length === 0 ? (
              <p className="muted">Nenhuma avaliação encontrada com os filtros aplicados.</p>
            ) : (
              filteredReviews.map((review) => {
                const isLowRating = review.rating <= 2
                const whatsappMsg = store?.whatsapp
                  ? `Olá, ${review.customerName}! Vi sua avaliação sobre o pedido na ${store.name}. Quero entender melhor o que aconteceu e te ajudar da melhor forma.`
                  : null
                const whatsappUrl =
                  store?.whatsapp && review.customerPhone && whatsappMsg
                    ? `https://wa.me/${review.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
                    : null

                return (
                  <article
                    key={review.id}
                    className="card card-default"
                    style={{
                      borderLeft: isLowRating ? '3px solid #ef4444' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <StarDisplay rating={review.rating} />
                          {isLowRating && (
                            <span
                              style={{
                                padding: '0.1rem 0.5rem',
                                borderRadius: '999px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              Atenção
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                          {review.customerName}
                        </p>
                        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          {' · '}
                          Pedido #{review.orderId}
                        </p>
                      </div>
                    </div>

                    {review.tags && review.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                        {review.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '0.15rem 0.55rem',
                              borderRadius: '999px',
                              background: 'var(--color-surface-raised, #f3f4f6)',
                              fontSize: '0.78rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {review.comment && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        "{review.comment}"
                      </p>
                    )}

                    {isLowRating && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: '#dc2626' }}>
                        💡 Entre em contato com o cliente para entender o problema.
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      <Link to={`/lojista/pedidos`}>
                        <Button variant="secondary" size="sm">Ver pedidos</Button>
                      </Link>
                      {whatsappUrl && (
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" size="sm">Chamar cliente</Button>
                        </a>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </>
      )}
    </section>
  )
}
