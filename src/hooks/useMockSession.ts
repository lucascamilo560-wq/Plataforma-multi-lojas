import { useEffect, useState } from 'react'
import type { UserRole } from '../types'

const SESSION_KEY = 'marketplace:role'

export function useMockSession() {
  const [role, setRoleState] = useState<UserRole>('customer')

  useEffect(() => {
    const storedRole = window.localStorage.getItem(SESSION_KEY) as UserRole | null
    if (storedRole) {
      setRoleState(storedRole)
    }
  }, [])

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole)
    window.localStorage.setItem(SESSION_KEY, nextRole)
  }

  return { role, setRole }
}
