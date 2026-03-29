import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import LocationsPage from './pages/LocationsPage'
import ProfilePage from './pages/ProfilePage'
import RoleManagementPage from './pages/RoleManagementPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<ProtectedRoute roles={['ROLE_MANAGER', 'ROLE_ADMIN']} />}>
              <Route path="/roles" element={<RoleManagementPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
