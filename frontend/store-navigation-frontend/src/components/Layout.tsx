
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const Layout = () => {
  const { user, logout, hasAnyRole, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate('/products')
  }

  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
      <div className="app-shell">
        {/* Mobile menu backdrop */}
        {mobileMenuOpen && <div className="sidebar-backdrop" onClick={closeMobileMenu} />}

        <aside className={`sidebar${mobileMenuOpen ? ' sidebar--open' : ''}`}>
          <div className="sidebar-brand">
            <div className="brand-mark">SN</div>
            <div>
              <h1>StoreNav</h1>
              <p>Бараа, байршлын систем</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <p className="sidebar-title">Үндсэн цэс</p>
            <NavLink to="/products" end onClick={closeMobileMenu}>
              Бараа хайлт
            </NavLink>
            <NavLink to="/locations" onClick={closeMobileMenu}>
              План зураг
            </NavLink>
            {isAuthenticated && (
                <NavLink to="/profile" onClick={closeMobileMenu}>
                  Миний профайл
                </NavLink>
            )}
            {canManage && (
                <NavLink to="/roles" onClick={closeMobileMenu}>
                  Эрхийн удирдлага
                </NavLink>
            )}
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
              <button type="button" className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span />
                <span />
                <span />
              </button>
              <div>
                <p className="page-kicker">Дэлгүүрийн навигаци</p>
                <h2>{isAuthenticated ? 'Хяналтын самбар' : 'Хайлтын самбар'}</h2>
              </div>
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