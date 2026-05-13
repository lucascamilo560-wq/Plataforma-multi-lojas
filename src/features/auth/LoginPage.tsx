import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Tabs } from '../../components/ui/Tabs'
import { useMockSession } from '../../hooks/useMockSession'
import { clearAllDemoData, clearCustomerSession, clearSellerSession, getCurrentSellerStoreId } from '../../services/mockData'
import type { UserRole } from '../../types'

const roleTabs = [
  { key: 'customer', label: 'Cliente', icon: 'cart' as const },
  { key: 'store_admin', label: 'Lojista', icon: 'storefront' as const },
  { key: 'super_admin', label: 'Super Admin', icon: 'shield' as const },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { setRole } = useMockSession()
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [errorMessage, setErrorMessage] = useState('')
  const [utilityMessage, setUtilityMessage] = useState('')

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
    <main className="container login-shell">
      <section className="stack-lg login-card">
        <SectionHeader
          kicker="Ambiente demo"
          icon="sparkles"
          title="Entre na área certa para o seu perfil"
          description="Este é um ambiente de demonstração com dados mockados no localStorage. Nenhum dado é enviado para um servidor."
        />

        <Card title="Continuar" subtitle="Escolha seu perfil e entre em segundos." variant="accentCorner">
          <div className="login-banner">
            <div className="stack" style={{ gap: '0.45rem' }}>
              <strong>Fluxos separados por perfil</strong>
              <p>Cada área foi organizada para uma experiência clara e focada.</p>
            </div>
            <Icon name="sparkles" className="icon-md" />
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            <Tabs
              items={roleTabs}
              activeKey={selectedRole}
              onChange={(role) => setSelectedRole(role as UserRole)}
            />

            <Input id="email" type="email" label="E-mail" placeholder="voce@empresa.com" required />
            <Input id="password" type="password" label="Senha" placeholder="••••••••" required />

            <Select
              id="role"
              label="Perfil"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            >
              <option value="customer">Cliente</option>
              <option value="store_admin">Lojista</option>
              <option value="super_admin">Super Admin</option>
            </Select>

            <Button type="submit" variant="accent" size="lg">
              <Icon name="arrowRight" className="icon-sm" />
              Entrar
            </Button>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </form>
        </Card>

        <Card
          title="Fluxo recomendado de teste"
          subtitle="Siga este roteiro para testar o fluxo real por convite"
          variant="layered"
        >
          <ol className="stack" style={{ gap: '0.4rem', paddingLeft: '1.2rem', margin: 0 }}>
            <li>Entre como <strong>Lojista</strong></li>
            <li>Crie uma loja em <em>Criar loja</em></li>
            <li>Vá em <em>Minha Vitrine</em> e copie o link público</li>
            <li>Volte ao login (sair pelo menu)</li>
            <li>Entre como <strong>Cliente</strong></li>
            <li>Cole o link da loja no campo de entrada</li>
            <li>Acesse e siga a loja</li>
          </ol>
          <p className="muted" style={{ marginTop: '0.6rem', fontSize: '0.8rem' }}>
            Clientes sem convite não veem lojas automaticamente — precisam do link do lojista.
          </p>
        </Card>

        <Card
          title="Utilitários demo"
          subtitle="Ferramentas para resetar o estado do ambiente de testes"
          variant="default"
        >
          <div className="stack" style={{ gap: '0.6rem' }}>
            <div className="inline-info">
              <Button variant="secondary" size="md" onClick={() => handleClearSession('customer')}>
                Limpar sessão cliente
              </Button>
              <Button variant="secondary" size="md" onClick={() => handleClearSession('store_admin')}>
                Limpar sessão lojista
              </Button>
              <Button variant="ghost" size="md" onClick={handleResetDemo}>
                Resetar todos os dados demo
              </Button>
            </div>
            {utilityMessage && <p className="muted" style={{ fontSize: '0.85rem' }}>{utilityMessage}</p>}
            <p className="muted" style={{ fontSize: '0.8rem' }}>
              "Resetar" apaga lojas criadas, produtos, pedidos e sessões. Use para iniciar testes limpos.
            </p>
          </div>
        </Card>
      </section>
    </main>
  )
}

