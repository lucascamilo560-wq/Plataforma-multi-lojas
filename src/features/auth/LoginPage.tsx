import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { useMockSession } from '../../hooks/useMockSession'
import { clearAllDemoData, clearCustomerSession, clearSellerSession, getCurrentSellerStoreId } from '../../services/mockData'
import { APP_BRAND } from '../../config/brand'
import type { UserRole } from '../../types'

const roleOptions: { key: UserRole; title: string; description: string; icon: 'cart' | 'storefront' }[] = [
  {
    key: 'customer',
    title: 'Comprar em uma loja',
    description: 'Acesse vitrines que você recebeu por link e acompanhe seus pedidos.',
    icon: 'cart',
  },
  {
    key: 'store_admin',
    title: 'Gerenciar minha loja',
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
  const { setRole } = useMockSession()
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [errorMessage, setErrorMessage] = useState('')
  const [utilityMessage, setUtilityMessage] = useState('')
  const [showDemoTools, setShowDemoTools] = useState(false)

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
        navigate('/cliente')
        return
      }

      navigate('/admin')
    } catch (error) {
      console.error('Erro ao entrar:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar agora.')
    }
  }

  const handleClearSession = (role: UserRole) => {
    if (role === 'customer') clearCustomerSession()
    else if (role === 'store_admin') clearSellerSession()
    setUtilityMessage('Sessão limpa com sucesso.')
  }

  const handleResetDemo = () => {
    clearAllDemoData()
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
          <div className="login-form-head">
            <h2 className="login-form-title">Bem-vindo</h2>
            <p className="login-form-subtitle">Escolha como quer continuar. Acesse uma loja por convite ou gerencie sua vitrine.</p>
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
                  <strong>{opt.title}</strong>
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
              Entrar no {APP_BRAND.name}
            </Button>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </form>

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

