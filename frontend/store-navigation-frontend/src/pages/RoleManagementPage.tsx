import { useEffect, useState } from 'react'
import { changeUserRole, listUsersForRoleManagement } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import type { Profile, Role } from '../types'

const roleToLabel: Record<Role, string> = {
  ROLE_USER: 'Хэрэглэгч',
  ROLE_STAFF: 'Ажилтан',
  ROLE_MANAGER: 'Менежер',
  ROLE_ADMIN: 'Админ',
}

const RoleManagementPage = () => {
  const { hasAnyRole, user } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isAdmin = hasAnyRole(['ROLE_ADMIN'])
  const isManager = hasAnyRole(['ROLE_MANAGER'])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listUsersForRoleManagement()
      setUsers(data)
    } catch {
      setError('Хэрэглэгчдийн жагсаалтыг ачаалж чадсангүй. Дахин нэвтэрч эсвэл backend service-үүдээ шалгана уу.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const getPrimaryRole = (roles: Role[]): Role => {
    if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN'
    if (roles.includes('ROLE_MANAGER')) return 'ROLE_MANAGER'
    if (roles.includes('ROLE_STAFF')) return 'ROLE_STAFF'
    return 'ROLE_USER'
  }

  const allowedOptions = (target: Profile): Role[] => {
    if (isAdmin) {
      return ['ROLE_USER', 'ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN']
    }
    if (isManager) {
      if (target.roles.includes('ROLE_ADMIN') || target.roles.includes('ROLE_MANAGER')) {
        return []
      }
      return ['ROLE_USER', 'ROLE_STAFF']
    }
    return []
  }

  const onRoleChange = async (target: Profile, role: Role) => {
    await changeUserRole(target.id, role)
    setMessage(`"${target.email}" хэрэглэгчийн эрх шинэчлэгдлээ.`)
    await loadUsers()
  }

  return (
    <section className="grid-section">
      <article className="card full-width">
        <h2>Хэрэглэгчийн эрхийн удирдлага</h2>
        <p className="muted">
          Админ бүх хэрэглэгчийн эрхийг солих боломжтой. Менежер хэрэглэгчийг ажилтан болгох болон
          ажилтны эрхийг удирдах боломжтой.
        </p>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Овог нэр</th>
                <th>И-мэйл</th>
                <th>Одоогийн эрх</th>
                <th>Шинэ эрх</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} data-label="Төлөв">Ачааллаж байна...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} data-label="Төлөв">Жагсаах хэрэглэгч алга.</td>
                </tr>
              ) : (
                users.map((target) => {
                  const options = allowedOptions(target)
                  const currentRole = getPrimaryRole(target.roles)

                  return (
                    <tr key={target.id}>
                      <td data-label="Овог нэр">{target.fullName}</td>
                      <td data-label="И-мэйл">{target.email}</td>
                      <td data-label="Одоогийн эрх">{target.roles.map((role) => roleToLabel[role]).join(', ')}</td>
                      <td data-label="Шинэ эрх">
                        {options.length === 0 || target.email === user?.email ? (
                          <span className="muted">Өөрчлөх боломжгүй</span>
                        ) : (
                          <select
                            value={currentRole}
                            onChange={(event) => void onRoleChange(target, event.target.value as Role)}
                          >
                            {options.map((role) => (
                              <option key={role} value={role}>
                                {roleToLabel[role]}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default RoleManagementPage


