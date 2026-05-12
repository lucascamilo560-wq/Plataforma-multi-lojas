import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
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
  { key: 'customer', label: 'Cliente' },
  { key: 'store_admin', label: 'Lojista' },
  { key: 'super_admin', label: 'Super Admin' },
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
      console.error('Erro no login mockado:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível iniciar sessão.')
    }
  }

  return (
    <main className="container app-main">
      <section className="stack-lg">
        <SectionHeader
          kicker="Acesso"
          title="Entrar na Plataforma"
          description="Experiência de login com seleção de perfil para navegar entre cliente, lojista e super admin."
        />

        <Card
          title="Acessar plataforma"
          subtitle="Auth real será conectado ao Supabase sem alterar o fluxo atual neste PR."
          variant="accentCorner"
        >
          <form className="stack" onSubmit={handleSubmit}>
            <Tabs
              items={roleTabs}
              activeKey={selectedRole}
              onChange={(role) => setSelectedRole(role as UserRole)}
            />

            <Input id="email" type="email" label="E-mail" placeholder="seu@email.com" required />
            <Input id="password" type="password" label="Senha" placeholder="••••••••" required />

            <Select
              id="role"
              label="Perfil para demonstração"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            >
              <option value="customer">Cliente final</option>
              <option value="store_admin">Lojista</option>
              <option value="super_admin">Super Admin</option>
            </Select>

            {selectedRole === 'store_admin' && (
              <Input
                id="store-id"
                label="Store ID (mock)"
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                placeholder="store-1"
                required
              />
            )}

            <Button type="submit" variant="accent">
              Entrar
            </Button>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </form>
        </Card>
      </section>
    </main>
  )
}
