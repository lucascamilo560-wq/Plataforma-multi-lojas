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
import type { UserRole } from '../../types'

const roleDestinations: Record<UserRole, string> = {
  customer: '/',
  store_admin: '/dashboard',
  super_admin: '/admin',
}

const roleTabs = [
  { key: 'customer', label: 'Cliente', icon: 'cart' as const },
  { key: 'store_admin', label: 'Lojista', icon: 'storefront' as const },
  { key: 'super_admin', label: 'Gestão', icon: 'shield' as const },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { setRole, setStoreId } = useMockSession()
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [selectedStoreId, setSelectedStoreId] = useState('store-1')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      setRole(selectedRole)

      if (selectedRole === 'store_admin') {
        setStoreId(selectedStoreId)
      }

      navigate(roleDestinations[selectedRole])
    } catch (error) {
      console.error('Erro ao entrar:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar agora.')
    }
  }

  return (
    <main className="container login-shell">
      <section className="stack-lg login-card">
        <SectionHeader
          kicker="Entrada"
          icon="sparkles"
          title="Acesse seu painel comercial"
          description="Entre para gerenciar pedidos, atualizar catálogo e acompanhar vendas em um ambiente de produto completo."
        />

        <Card title="Continuar" subtitle="Escolha seu perfil e entre em segundos." variant="accentCorner">
          <div className="login-banner">
            <div className="stack" style={{ gap: '0.45rem' }}>
              <strong>Experiência premium para cada perfil</strong>
              <p>Cliente, lojista e gestão em uma navegação fluida.</p>
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
              <option value="super_admin">Equipe de gestão</option>
            </Select>

            {selectedRole === 'store_admin' && (
              <Input
                id="store-id"
                label="Código da loja"
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                placeholder="store-1"
                required
              />
            )}

            <Button type="submit" variant="accent" size="lg">
              <Icon name="arrowRight" className="icon-sm" />
              Entrar no app
            </Button>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </form>
        </Card>
      </section>
    </main>
  )
}
