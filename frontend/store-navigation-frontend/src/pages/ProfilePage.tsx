import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getMyDetailedProfile, updateMyDetailedProfile } from '../api/userProfile'

const roleLabelMap: Record<string, string> = {
  ROLE_ADMIN: 'Админ',
  ROLE_MANAGER: 'Менежер',
  ROLE_STAFF: 'Ажилтан',
  ROLE_USER: 'Хэрэглэгч',
}

const ProfilePage = () => {
  const { user, refreshProfile, saveProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  useEffect(() => {
    const loadDetails = async () => {
      const details = await getMyDetailedProfile()
      setPhoneNumber(details.phoneNumber || '')
      setBio(details.bio || '')
      setAvatarUrl(details.avatarUrl || '')
    }
    void loadDetails()
  }, [])

  useEffect(() => {
    setFullName(user?.fullName || '')
  }, [user])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await Promise.all([
      saveProfile({ fullName, password: password || undefined }),
      updateMyDetailedProfile({
        phoneNumber: phoneNumber || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      }),
    ])
    setPassword('')
    setMessage('Профайл амжилттай шинэчлэгдлээ.')
  }

  return (
    <section className="dashboard-grid">
      <article className="panel span-8">
        <h3>Профайлын тохиргоо</h3>
        <p className="muted">Хувийн мэдээлэл болон нууцлалын тохиргоогоо шинэчилнэ.</p>
        {message && <p className="success">{message}</p>}

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Овог нэр
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} required />
          </label>
          <label>
            Шинэ нууц үг
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} />
          </label>
          <label>
            Утасны дугаар
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          </label>
          <label>
            Зургийн холбоос
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
          </label>
          <label className="full">
            Танилцуулга
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary full">
            Хадгалах
          </button>
        </form>
      </article>

      <article className="panel span-4">
        <h3>Бүртгэлийн мэдээлэл</h3>
        <p>
          <strong>И-мэйл:</strong> {user?.email}
        </p>
        <p>
          <strong>Эрх:</strong> {user?.roles.map((role) => roleLabelMap[role] || role).join(', ')}
        </p>
      </article>
    </section>
  )
}

export default ProfilePage
