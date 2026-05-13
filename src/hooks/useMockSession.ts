import { useState } from 'react'
import type { UserRole } from '../types'

const SESSION_ROLE_KEY = 'marketplace:session:role'
const SESSION_STORE_KEY = 'marketplace:seller:store-id'

const validRoles: UserRole[] = ['customer', 'store_admin', 'super_admin']

/** Identificadores mock fixos por perfil — usados para separar sessões no localStorage. */
export const MOCK_USER_IDS: Record<UserRole, string> = {
  customer: 'cliente-demo',
  store_admin: 'lojista-demo',
  super_admin: 'admin-demo',
}

function getStoredRole(): UserRole {
  const storedRole = window.localStorage.getItem(SESSION_ROLE_KEY) as UserRole | null
  return storedRole && validRoles.includes(storedRole) ? storedRole : 'customer'
}

function getStoredStoreId() {
  return window.localStorage.getItem(SESSION_STORE_KEY) ?? ''
}

export function useMockSession() {
  const [role, setRoleState] = useState<UserRole>(getStoredRole)
  const [storeId, setStoreIdState] = useState<string>(getStoredStoreId)

  /** ID do usuário mock baseado no perfil atual. */
  const userId = MOCK_USER_IDS[role]

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole)
    window.localStorage.setItem(SESSION_ROLE_KEY, nextRole)
    // Atualiza o storeId para refletir o perfil recém-selecionado
    setStoreIdState(getStoredStoreId())
  }

  const setStoreId = (nextStoreId: string) => {
    const normalizedStoreId = nextStoreId.trim()
    if (!normalizedStoreId) {
      throw new Error('Informe um código de loja válido para continuar.')
    }
    setStoreIdState(normalizedStoreId)
    window.localStorage.setItem(SESSION_STORE_KEY, normalizedStoreId)
  }

  /** Limpa somente a sessão do perfil atual sem apagar dados de outros perfis. */
  const clearSession = () => {
    if (role === 'customer') {
      const customerKeys = [
        'marketplace:customer:active-slug',
        'marketplace:customer:invited-slug',
        'marketplace:customer:last-visited-slug',
        'marketplace:customer:followed-stores',
        'marketplace:customer:cart',
      ]
      customerKeys.forEach((key) => window.localStorage.removeItem(key))
    } else if (role === 'store_admin') {
      window.localStorage.removeItem(SESSION_STORE_KEY)
      setStoreIdState('')
    }
  }

  return { role, setRole, storeId, setStoreId, userId, clearSession }
}
