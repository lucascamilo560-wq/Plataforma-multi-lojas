import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { useMockSession } from '../../hooks/useMockSession'
import {
  clearAllDemoData,
  clearCustomerSession,
  clearPendingStoreInvite,
  clearSellerSession,
  getCurrentSellerStoreId,
  getPendingStoreInvite,
  getStoreBySlug,
  setPendingStoreInvite,
} from '../../services/mockData'
import { APP_BRAND } from '../../config/brand'
import type { PendingStoreInvite } from '../../services/mockData'
import type { UserRole } from '../../types'

const roleOptions: { key: UserRole; title: string; titleWithInvite: string; description: string; icon: 'cart' | 'storefront' }[] = [
  {
    key: 'customer',
    title: 'Comprar em uma loja',
    titleWithInvite: 'Entrar para ver a loja',
    description: 'Acesse vitrines que você recebeu por link e acompanhe seus pedidos.',
    icon: 'cart',
  },
  {
    key: 'store_admin',
    title: 'Gerenciar minha loja',
    titleWithInvite: 'Tenho uma loja',
    description: 'Cadastre produtos, receba pedidos, compartilhe sua vitrine e fidelize clientes.',
    icon: 'storefront',
  },
]

const valueProps = [
  {
    icon: 'storefront' as const,
    title: 'Vitrine própria',
    description: 'Cada lojista compartilha sua própria loja por link.',
  },
  {
    icon: 'package' as const,
    title: 'Pedidos organizados',
    description: 'Cliente compra, lojista acompanha e atende com clareza.',
  },
  {
    icon: 'star' as const,
    title: 'Relacionamento',
    description: 'CRM, avaliações e mensagens ajudam a fidelizar.',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setRole } = useMockSession()
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [errorMessage, setErrorMessage] = useState('')
  const [utilityMessage, setUtilityMessage] = useState('')
  const [showDemoTools, setShowDemoTools] = useState(false)
  const [pendingInvite, setPendingInvite] = useState<PendingStoreInvite | null>(null)

  // Resolve pending invite from query params or localStorage
  useEffect(() => {
    async function resolveInvite() {
      // Extract slug from query params: ?invite=slug, ?loja=slug, or ?from=/loja/slug
      const inviteParam = searchParams.get('invite') ?? searchParams.get('loja')
      let slugFromParam: string | null = inviteParam

      if (!slugFromParam) {
        const fromParam = searchParams.get('from')
        if (fromParam) {
          const match = fromParam.match(/^\/loja\/([^/?]+)/)
          slugFromParam = match ? match[1] : null
        }
      }

      if (slugFromParam) {
        const store = await getStoreBySlug(slugFromParam)
        if (store) {
          const invite: PendingStoreInvite = {
            slug: store.slug,
            storeId: store.id,
            storeName: store.name,
            logoUrl: store.logoUrl,
            capturedAt: new Date().toISOString(),
            source: 'invite_link',
          }
          setPendingStoreInvite(invite)
          setPendingInvite(invite)
          setSelectedRole('customer')
          return
        }
      }

      // Fallback to localStorage
      const saved = getPendingStoreInvite()
      if (saved) {
        setPendingInvite(saved)
        setSelectedRole('customer')
      }
    }

    void resolveInvite()
  }, [searchParams])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      setRole(selectedRole)

      if (selectedRole === 'store_admin') {
        const storeId = getCurrentSellerStoreId()
        navigate(storeId ? '/lojista' : '/lojista/criar-loja')
        return
      }

      if (selectedRole === 'customer') {
        if (pendingInvite) {
          navigate('/cliente/convite')
        } else {
          navigate('/cliente')
        }
        return
      }

      navigate('/admin')
    } catch (error) {
      console.error('Erro ao entrar:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar agora.')
    }
  }

  const handleClearInvite = () => {
    clearPendingStoreInvite()
    setPendingInvite(null)
    setSelectedRole('customer')
  }

  const handleClearSession = (role: UserRole) => {
    if (role === 'customer') clearCustomerSession()
    else if (role === 'store_admin') clearSellerSession()
    setUtilityMessage('Sessão limpa com sucesso.')
  }

  const handleResetDemo = () => {
    clearAllDemoData()
    setPendingInvite(null)
    setUtilityMessage('Todos os dados demo foram apagados. Recarregue a página para começar do zero.')
  }

  return (
    <main className="login-page">
      {/* Left / top — hero de marca */}
      <div className="login-hero">
        <div className="login-hero-inner">
          <div className="login-brand">
            <img src={APP_BRAND.iconPath} alt={APP_BRAND.markDescription} className="login-brand-icon" />
            <span className="login-brand-name">{APP_BRAND.name}</span>
          </div>

          <h1 className="login-hero-title">{APP_BRAND.slogan}</h1>
          <p className="login-hero-desc">
            Crie uma vitrine digital, receba pedidos e mantenha seus clientes por perto — sem virar marketplace aberto.
          </p>

          <ul className="login-value-list">
            {valueProps.map((vp) => (
              <li key={vp.title} className="login-value-item">
                <span className="login-value-icon">
                  <Icon name={vp.icon} className="icon-md" />
                </span>
                <div>
                  <strong>{vp.title}</strong>
                  <p className="login-value-desc">{vp.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right / bottom — card de entrada */}
      <div className="login-form-area">
        <div className="login-form-card">
          {/* Invite context banner */}
          {pendingInvite && (
            <div className="login-invite-banner">
              {pendingInvite.logoUrl && (
                <img
                  src={pendingInvite.logoUrl}
                  alt={pendingInvite.storeName}
                  className="login-invite-logo"
                />
              )}
              <div className="login-invite-text">
                <p className="login-invite-label">Você foi convidado para acessar</p>
                <strong className="login-invite-store">{pendingInvite.storeName}</strong>
                <p className="login-invite-sub">Uma loja HubMascate</p>
              </div>
              <button
                type="button"
                className="login-invite-clear"
                onClick={handleClearInvite}
                title="Limpar convite"
                aria-label="Limpar convite"
              >
                <Icon name="close" className="icon-sm" />
              </button>
            </div>
          )}

          <div className="login-form-head">
            <h2 className="login-form-title">{pendingInvite ? `Bem-vindo à ${pendingInvite.storeName}` : 'Bem-vindo'}</h2>
            <p className="login-form-subtitle">
              {pendingInvite
                ? 'Entre para acessar a loja ou gerencie sua própria vitrine.'
                : 'Escolha como quer continuar. Acesse uma loja por convite ou gerencie sua vitrine.'}
            </p>
          </div>

          {/* Seleção de perfil */}
          <div className="login-role-list">
            {roleOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`login-role-card${selectedRole === opt.key ? ' login-role-card-active' : ''}`}
                onClick={() => setSelectedRole(opt.key)}
              >
                <span className="login-role-icon">
                  <Icon name={opt.icon} className="icon-md" />
                </span>
                <div className="login-role-text">
                  <strong>{pendingInvite ? opt.titleWithInvite : opt.title}</strong>
                  <p>{opt.description}</p>
                </div>
                {selectedRole === opt.key && (
                  <span className="login-role-check">
                    <Icon name="check" className="icon-sm" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            <Input id="email" type="email" label="E-mail" placeholder="voce@empresa.com" required />
            <Input id="password" type="password" label="Senha" placeholder="••••••••" required />

            <Button type="submit" variant="accent" size="lg">
              <Icon name="arrowRight" className="icon-sm" />
              {pendingInvite && selectedRole === 'customer' ? `Entrar e ver ${pendingInvite.storeName}` : `Entrar no ${APP_BRAND.name}`}
            </Button>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </form>

          {pendingInvite && (
            <button type="button" className="login-invite-dismiss" onClick={handleClearInvite}>
              Continuar sem convite
            </button>
          )}

          {/* Ferramentas de teste — discretas */}
          <div className="login-demo-tools">
            <button
              type="button"
              className="login-demo-toggle"
              onClick={() => setShowDemoTools((v) => !v)}
            >
              {showDemoTools ? 'Ocultar ferramentas de teste' : 'Mostrar ferramentas de teste'}
            </button>

            {showDemoTools && (
              <div className="login-demo-panel stack" style={{ gap: '0.8rem' }}>
                <p className="login-demo-section-title">Fluxo recomendado de teste</p>
                <ol style={{ gap: '0.35rem', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
                  <li>Entre como <strong>Lojista</strong></li>
                  <li>Crie uma loja em <em>Criar loja</em></li>
                  <li>Vá em <em>Minha Vitrine</em> e copie o link público</li>
                  <li>Volte ao login (sair pelo menu)</li>
                  <li>Entre como <strong>Cliente</strong></li>
                  <li>Cole o link da loja no campo de entrada</li>
                  <li>Acesse e siga a loja</li>
                </ol>
                <p className="muted" style={{ fontSize: '0.78rem' }}>
                  Clientes sem convite não veem lojas automaticamente — precisam do link do lojista.
                </p>

                <p className="login-demo-section-title" style={{ marginTop: '0.4rem' }}>Utilitários</p>
                <div className="inline-info">
                  <Button variant="secondary" size="md" onClick={() => handleClearSession('customer')}>
                    Limpar sessão cliente
                  </Button>
                  <Button variant="secondary" size="md" onClick={() => handleClearSession('store_admin')}>
                    Limpar sessão lojista
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleResetDemo}>
                    Resetar dados demo
                  </Button>
                </div>

                <p className="login-demo-section-title" style={{ marginTop: '0.4rem' }}>Acesso interno</p>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => { setRole('super_admin'); navigate('/admin') }}
                >
                  <Icon name="shield" className="icon-sm" />
                  Entrar como Super Admin (demo)
                </Button>
                {utilityMessage && <p className="muted" style={{ fontSize: '0.82rem' }}>{utilityMessage}</p>}
                <p className="muted" style={{ fontSize: '0.78rem' }}>
                  "Resetar" apaga lojas, produtos, pedidos e sessões. Use para testes limpos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

