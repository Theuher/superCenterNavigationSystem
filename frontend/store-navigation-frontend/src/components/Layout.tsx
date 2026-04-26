import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const Layout = () => {
  const { user, logout, hasAnyRole, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/products')
  }

  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">SN</div>
          <div>
            <h1>StoreNav</h1>
            <p>Бараа, байршлын систем</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-title">Үндсэн цэс</p>
          <NavLink to="/products" end>
            Бараа хайлт
          </NavLink>
          <NavLink to="/locations">План зураг</NavLink>
          {isAuthenticated && <NavLink to="/profile">Миний профайл</NavLink>}
          {canManage && <NavLink to="/roles">Эрхийн удирдлага</NavLink>}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">{(user?.fullName || user?.email || 'З').charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user?.fullName || 'Зочин хэрэглэгч'}</strong>
            <p>{user?.email || 'Нэвтрээгүй байна'}</p>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <p className="page-kicker">Дэлгүүрийн навигаци</p>
            <h2>{isAuthenticated ? 'Хяналтын самбар' : 'Хайлтын самбар'}</h2>
          </div>

          <div className="topbar-actions">
            <Link className="search-link" to="/locations">
              Бараа хайх
            </Link>
            {canManage && <span className="role-chip">Удирдлагын эрх</span>}
            {isAuthenticated ? (
              <button className="btn btn-secondary" onClick={onLogout}>
                Гарах
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Нэвтрэх
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
