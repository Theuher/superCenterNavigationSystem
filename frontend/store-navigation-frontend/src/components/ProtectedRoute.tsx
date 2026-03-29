import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Role } from '../types'

interface Props {
  roles?: Role[]
}

const ProtectedRoute = ({ roles }: Props) => {
  const { isAuthenticated, hasAnyRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/products" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

