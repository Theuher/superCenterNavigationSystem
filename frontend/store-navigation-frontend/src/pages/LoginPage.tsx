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
      <form className="panel auth-card" onSubmit={onSubmit}>
        <div className="auth-head">
          <h1>Тавтай морил</h1>
          <p className="muted">Дэлгүүрийн бараа, байршлын мэдээллийг удирдахын тулд нэвтэрнэ үү.</p>
        </div>
        {error && <p className="error">{error}</p>}
        <label>
          И-мэйл
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Нууц үг
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </button>
        <p className="muted">
          Бүртгэлгүй юу? <Link to="/register">Бүртгүүлэх</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
