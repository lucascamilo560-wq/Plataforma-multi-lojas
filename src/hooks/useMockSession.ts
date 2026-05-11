import { useState } from 'react'
import type { UserRole } from '../types'

const SESSION_KEY = 'marketplace:role'

export function useMockSession() {
  const [role, setRoleState] = useState<UserRole>(() => {
    const storedRole = window.localStorage.getItem(SESSION_KEY) as UserRole | null
    return storedRole ?? 'customer'
  })

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole)
    window.localStorage.setItem(SESSION_KEY, nextRole)
  }

  return { role, setRole }
}
