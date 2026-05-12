import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMockSession } from '../../hooks/useMockSession'
import type { UserRole } from '../../types'

const defaultRouteByRole: Record<UserRole, string> = {
  customer: '/cliente',
  store_admin: '/lojista',
  super_admin: '/admin',
}

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { role } = useMockSession()

  if (!allowedRoles.includes(role)) {
    return <Navigate to={defaultRouteByRole[role]} replace />
  }

  return <>{children}</>
}
