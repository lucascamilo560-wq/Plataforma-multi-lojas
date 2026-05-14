import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import type { SellerOnboardingStatus } from '../../services/mockData'

interface Props {
  status: SellerOnboardingStatus
  storefrontUrl: string
  onCopyLink: () => void
  copyMessage?: string
}

export function SellerOnboardingChecklist({ status, storefrontUrl, onCopyLink, copyMessage }: Props) {
  const { steps, completedCount, totalCount, progressPercent, isReadyToShare } = status
  const remaining = totalCount - completedCount

  const nextStep = steps.find((s) => !s.completed)

  return (
    <article
      className="card card-default"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      {/* Header */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="inline-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Icon name="sparkles" className="icon-md" style={{ color: 'var(--accent-violet)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Prepare sua loja para vender
            </h3>
          </div>
          {isReadyToShare ? (
            <Badge variant="success">✓ Pronta para compartilhar</Badge>
          ) : (
            <Badge variant="muted">
              {remaining === 1 ? 'Falta 1 etapa' : `Faltam ${remaining} etapas`}
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do onboarding"
            style={{
              height: '8px',
              borderRadius: '999px',
              background: 'var(--surface-strong)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                borderRadius: '999px',
                background: isReadyToShare
                  ? 'var(--success)'
                  : 'linear-gradient(90deg, var(--accent-violet) 0%, var(--accent-blue) 100%)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {completedCount} de {totalCount} etapas concluídas
          </p>
        </div>
      </header>

      {/* Steps list */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {steps.map((step) => (
          <li
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.7rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: step.completed ? 'color-mix(in srgb, var(--success) 8%, transparent)' : 'var(--surface-alt)',
              border: `1px solid ${step.completed ? 'color-mix(in srgb, var(--success) 22%, transparent)' : 'var(--border-soft)'}`,
              opacity: step.id === 'storefront' && !step.completed ? 0.75 : 1,
            }}
          >
            {/* Status icon */}
            <span
              style={{
                flexShrink: 0,
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: step.completed ? 'var(--success)' : 'var(--surface-strong)',
                color: step.completed ? '#fff' : 'var(--text-muted)',
                marginTop: '0.05rem',
              }}
            >
              {step.completed ? (
                <Icon name="check" className="icon-sm" />
              ) : (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {steps.indexOf(step) + 1}
                </span>
              )}
            </span>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: step.completed ? 'var(--success)' : 'var(--text-primary)',
                    textDecoration: step.completed ? 'line-through' : 'none',
                    textDecorationColor: 'color-mix(in srgb, var(--success) 60%, transparent)',
                  }}
                >
                  {step.title}
                </span>
                {!step.required && (
                  <Badge variant="muted">Recomendado</Badge>
                )}
              </div>
              <p
                style={{
                  margin: '0.15rem 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                }}
              >
                {step.description}
              </p>
            </div>

            {/* Action */}
            {!step.completed && (
              <Link to={step.to} style={{ flexShrink: 0 }}>
                <Button variant="ghost" size="sm">
                  {step.actionLabel}
                  <Icon name="arrowRight" className="icon-sm" />
                </Button>
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* Footer action */}
      <footer style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {isReadyToShare ? (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Button variant="accent" size="md" onClick={onCopyLink}>
              <Icon name="storefront" className="icon-sm" />
              Copiar link da vitrine
            </Button>
            <Link to="/lojista/minha-vitrine">
              <Button variant="secondary" size="md">
                Ver vitrine
              </Button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {nextStep && (
                <Link to={nextStep.to}>
                  <Button variant="accent" size="md">
                    Continuar configuração
                    <Icon name="arrowRight" className="icon-sm" />
                  </Button>
                </Link>
              )}
              <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="md">
                  Prévia da vitrine
                </Button>
              </a>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sua vitrine já pode ser visualizada, mas ainda faltam etapas para vender melhor.
            </p>
          </div>
        )}

        {copyMessage && (
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--success)' }}>{copyMessage}</p>
        )}
      </footer>
    </article>
  )
}
