import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { APP_BRAND } from '../../config/brand'
import {
  clearPendingStoreInvite,
  getCustomerProfile,
  getPendingStoreInvite,
  isCustomerProfileComplete,
} from '../../services/mockData'
import type { PendingStoreInvite } from '../../services/mockData'

export function CustomerInviteContinuePage() {
  const navigate = useNavigate()
  const [invite, setInvite] = useState<PendingStoreInvite | null>(() => getPendingStoreInvite())
  const [profileComplete] = useState<boolean>(() => isCustomerProfileComplete(getCustomerProfile()))
  const [showAppInfo, setShowAppInfo] = useState(false)

  const handleRemoveInvite = () => {
    clearPendingStoreInvite()
    setInvite(null)
  }

  if (!invite) {
    return (
      <div className="invite-continue-shell">
        <div className="invite-continue-card card card-layered">
          <div className="invite-continue-brand">
            <img src={APP_BRAND.iconPath} alt={APP_BRAND.markDescription} className="invite-continue-brand-icon" />
            <span className="invite-continue-brand-name">{APP_BRAND.name}</span>
          </div>

          <div className="invite-continue-empty">
            <p className="invite-continue-empty-text">Nenhuma loja de convite encontrada.</p>
          </div>

          <div className="stack" style={{ gap: '0.7rem' }}>
            <Button variant="primary" size="lg" onClick={() => navigate('/cliente/minhas-lojas')}>
              <Icon name="storefront" className="icon-sm" />
              Ir para minhas lojas
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/cliente')}>
              Início
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="invite-continue-shell">
      <div className="invite-continue-card card card-layered">
        {/* Brand header */}
        <div className="invite-continue-brand">
          <img src={APP_BRAND.iconPath} alt={APP_BRAND.markDescription} className="invite-continue-brand-icon" />
          <span className="invite-continue-brand-name">{APP_BRAND.name}</span>
        </div>

        {/* Store card */}
        <div className="invite-continue-store-card">
          {invite.logoUrl ? (
            <img
              src={invite.logoUrl}
              alt={invite.storeName}
              className="invite-continue-store-logo"
            />
          ) : (
            <div className="invite-continue-store-logo-placeholder">
              <Icon name="storefront" className="icon-md" />
            </div>
          )}
          <div className="invite-continue-store-info">
            <p className="invite-continue-store-label">Você entrou para acessar esta loja.</p>
            <strong className="invite-continue-store-name">{invite.storeName}</strong>
            <p className="invite-continue-store-sub">Uma loja {APP_BRAND.name}</p>
          </div>
        </div>

        {/* Profile status */}
        <div className={`invite-continue-profile-status${profileComplete ? ' invite-continue-profile-ok' : ' invite-continue-profile-warn'}`}>
          <Icon name={profileComplete ? 'check' : 'user'} className="icon-sm" />
          <span>
            {profileComplete
              ? 'Perfil pronto para comprar.'
              : 'Complete seu perfil antes da primeira compra.'}
          </span>
        </div>

        {/* Primary action */}
        <Button
          variant="accent"
          size="lg"
          onClick={() => navigate(`/loja/${invite.slug}`)}
        >
          <Icon name="arrowRight" className="icon-sm" />
          {`Ver loja ${invite.storeName}`}
        </Button>

        {/* Secondary action */}
        {!profileComplete ? (
          <Button variant="secondary" size="md" onClick={() => navigate('/cliente/perfil')}>
            <Icon name="user" className="icon-sm" />
            Completar perfil
          </Button>
        ) : (
          <Button variant="secondary" size="md" onClick={() => navigate('/cliente/pedidos')}>
            <Icon name="package" className="icon-sm" />
            Meus pedidos
          </Button>
        )}

        {/* Profile hint when incomplete */}
        {!profileComplete && (
          <p className="invite-continue-hint">
            Você pode ver a loja agora. Para confirmar pedido, complete o perfil.
          </p>
        )}

        {/* App install (mock) */}
        <div className="invite-continue-app-section">
          <button
            type="button"
            className="invite-continue-app-btn"
            onClick={() => setShowAppInfo((v) => !v)}
          >
            <Icon name="hub" className="icon-sm" />
            {showAppInfo ? 'Ocultar info do app' : 'Baixar app'}
          </button>

          {showAppInfo && (
            <div className="invite-continue-app-info">
              <p>
                Em breve você poderá instalar o {APP_BRAND.name} no celular para abrir suas lojas mais rápido.
                Quando o app estiver publicado, entre com esta mesma conta para ver suas lojas.
              </p>
            </div>
          )}
        </div>

        {/* Remove invite — discrete */}
        <button
          type="button"
          className="invite-continue-remove"
          onClick={handleRemoveInvite}
        >
          Remover convite
        </button>
      </div>
    </div>
  )
}
