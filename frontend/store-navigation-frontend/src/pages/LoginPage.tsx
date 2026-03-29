import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/products')
    } catch {
      setError('И-мэйл эсвэл нууц үг буруу байна.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={onSubmit}>
        <h1>Тавтай морил</h1>
        <p className="muted">Бараа хайх болон мэдээлэл удирдахын тулд нэвтэрнэ үү.</p>
        {error && <p className="error">{error}</p>}
        <label>
          И-мэйл
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Нууц үг
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}</button>
        <p className="muted">
          Бүртгэлгүй юу? <Link to="/register">Бүртгүүлэх</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage


