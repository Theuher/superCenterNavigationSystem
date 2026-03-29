import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse, Profile, Role } from '../types'
import { setAuthToken } from '../api/http'
import { getMe, login as loginApi, register as registerApi, updateMe } from '../api/auth'

interface AuthContextValue {
  token: string | null
  user: Profile | null
  isAuthenticated: boolean
  hasAnyRole: (roles: Role[]) => boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  saveProfile: (payload: { fullName?: string; password?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'scn_token'
const USER_KEY = 'scn_user'

const toRoleArray = (value: unknown): Role[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((item): item is Role => typeof item === 'string' && item.startsWith('ROLE_'))
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<Profile | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Profile
      return { ...parsed, roles: toRoleArray(parsed.roles) }
    } catch {
      return null
    }
  })

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const applyAuthResponse = (response: AuthResponse) => {
    setToken(response.accessToken)
    setUser(response.user)
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
  }

  const login = async (email: string, password: string) => {
    const response = await loginApi({ email, password })
    applyAuthResponse(response)
  }

  const register = async (fullName: string, email: string, password: string) => {
    const response = await registerApi({ fullName, email, password })
    applyAuthResponse(response)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
  }

  const refreshProfile = async () => {
    const profile = await getMe()
    setUser(profile)
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
  }

  const saveProfile = async (payload: { fullName?: string; password?: string }) => {
    const profile = await updateMe(payload)
    setUser(profile)
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
  }

  const hasAnyRole = (roles: Role[]) => {
    if (!user) return false
    return roles.some((role) => user.roles.includes(role))
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      hasAnyRole,
      login,
      register,
      logout,
      refreshProfile,
      saveProfile,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

