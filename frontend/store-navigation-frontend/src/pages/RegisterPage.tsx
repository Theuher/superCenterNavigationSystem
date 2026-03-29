import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(fullName, email, password)
      navigate('/products')
    } catch {
      setError('Бүртгэж чадсангүй. Өөр и-мэйл ашиглана уу.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={onSubmit}>
        <h1>Бүртгэл үүсгэх</h1>
        <p className="muted">Дэлгүүрийн чиглүүлэлтийн системийг ашиглаж эхлээрэй.</p>
        {error && <p className="error">{error}</p>}
        <label>
          Овог нэр
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={2} required />
        </label>
        <label>
          И-мэйл
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Нууц үг
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Үүсгэж байна...' : 'Бүртгүүлэх'}</button>
        <p className="muted">
          Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage

