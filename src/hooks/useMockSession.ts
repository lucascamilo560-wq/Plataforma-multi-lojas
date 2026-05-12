import { useState } from 'react'
import type { UserRole } from '../types'

const SESSION_ROLE_KEY = 'marketplace:role'
const SESSION_STORE_KEY = 'marketplace:store_id'
const DEFAULT_STORE_ID = 'store-1'

const validRoles: UserRole[] = ['customer', 'store_admin', 'super_admin']

function getStoredRole(): UserRole {
  const storedRole = window.localStorage.getItem(SESSION_ROLE_KEY) as UserRole | null
  return storedRole && validRoles.includes(storedRole) ? storedRole : 'customer'
}

function getStoredStoreId() {
  return window.localStorage.getItem(SESSION_STORE_KEY) ?? DEFAULT_STORE_ID
}

export function useMockSession() {
  const [role, setRoleState] = useState<UserRole>(getStoredRole)
  const [storeId, setStoreIdState] = useState<string>(getStoredStoreId)

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole)
    window.localStorage.setItem(SESSION_ROLE_KEY, nextRole)
  }

  const setStoreId = (nextStoreId: string) => {
    const normalizedStoreId = nextStoreId.trim()
    if (!normalizedStoreId) {
      throw new Error('Informe um código de loja válido para continuar.')
    }
    setStoreIdState(normalizedStoreId)
    window.localStorage.setItem(SESSION_STORE_KEY, normalizedStoreId)
  }

  return { role, setRole, storeId, setStoreId }
}
