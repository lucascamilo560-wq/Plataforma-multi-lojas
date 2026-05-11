import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import type { UserRole } from '../../types'

const roleDestinations: Record<UserRole, string> = {
  customer: '/',
  store_admin: '/dashboard',
  super_admin: '/admin',
}

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
      <PageHeader
        title="Login"
        description="Fluxo inicial mockado para acessar as áreas de cliente, lojista e super admin."
      />
      <Card title="Acessar plataforma" subtitle="Autenticação real será conectada ao Supabase Auth.">
        <form className="stack" onSubmit={handleSubmit}>
          <label htmlFor="email" className="field-label">
            E-mail
          </label>
          <input id="email" type="email" placeholder="seu@email.com" className="input" required />

          <label htmlFor="password" className="field-label">
            Senha
          </label>
          <input id="password" type="password" placeholder="••••••••" className="input" required />

          <label htmlFor="role" className="field-label">
            Perfil para demonstração
          </label>
          <select
            id="role"
            className="input"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as UserRole)}
          >
            <option value="customer">Cliente final</option>
            <option value="store_admin">Lojista</option>
            <option value="super_admin">Super Admin</option>
          </select>

          {selectedRole === 'store_admin' && (
            <>
              <label htmlFor="store-id" className="field-label">
                Store ID (mock)
              </label>
              <input
                id="store-id"
                className="input"
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                placeholder="store-1"
                required
              />
            </>
          )}

          <Button type="submit">Entrar</Button>
          {errorMessage && <p className="error-text">{errorMessage}</p>}
        </form>
      </Card>
    </main>
  )
}
