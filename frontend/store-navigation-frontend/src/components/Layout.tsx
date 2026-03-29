import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const Layout = () => {
  const { user, logout, hasAnyRole } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/products" className="brand">SuperCenter Чиглүүлэлт</Link>
        <nav className="nav-links">
          <NavLink to="/products">Бараа</NavLink>
          <NavLink to="/locations">Байршил</NavLink>
          <NavLink to="/profile">Профайл</NavLink>
          {canManage && <NavLink to="/roles">Эрхийн удирдлага</NavLink>}
        </nav>
        <div className="header-actions">
          <span className="user-chip">{user?.fullName || user?.email}</span>
          {canManage && <span className="role-chip">Удирдлага</span>}
          <button onClick={onLogout}>Гарах</button>
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout




