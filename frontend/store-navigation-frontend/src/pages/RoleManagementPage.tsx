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

const roleBadgeClass: Record<Role, string> = {
  ROLE_USER: 'badge badge-muted',
  ROLE_STAFF: 'badge badge-ok',
  ROLE_MANAGER: 'badge badge-warn',
  ROLE_ADMIN: 'badge badge-danger',
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
      setError('Хэрэглэгчийн жагсаалт ачаалж чадсангүй. Auth сервисээ шалгана уу.')
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
    try {
      await changeUserRole(target.id, role)
      setMessage(`"${target.email}" хэрэглэгчийн эрх шинэчлэгдлээ.`)
      setError('')
      await loadUsers()
    } catch {
      setError('Эрх шинэчлэхэд алдаа гарлаа. Серверийн RBAC тохиргоог шалгана уу.')
    }
  }

  return (
    <section className="dashboard-grid">
      <article className="panel span-12">
        <h3>Хэрэглэгчийн эрхийн удирдлага</h3>
        <p className="muted">Админ бүх эрхийг удирдана. Менежер зөвхөн хэрэглэгч, ажилтны эрх онооно.</p>
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
                  <td colSpan={4} data-label="Төлөв">
                    Ачаалж байна...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} data-label="Төлөв">
                    Хэрэглэгч олдсонгүй.
                  </td>
                </tr>
              ) : (
                users.map((target) => {
                  const options = allowedOptions(target)
                  const currentRole = getPrimaryRole(target.roles)

                  return (
                    <tr key={target.id}>
                      <td data-label="Овог нэр">{target.fullName}</td>
                      <td data-label="И-мэйл">{target.email}</td>
                      <td data-label="Одоогийн эрх">
                        <div className="action-buttons">
                          {target.roles.map((role) => (
                            <span className={roleBadgeClass[role]} key={role}>
                              {roleToLabel[role]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td data-label="Шинэ эрх">
                        {options.length === 0 || target.email === user?.email ? (
                          <span className="muted">Өөрчлөх боломжгүй</span>
                        ) : (
                          <select value={currentRole} onChange={(event) => void onRoleChange(target, event.target.value as Role)}>
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
