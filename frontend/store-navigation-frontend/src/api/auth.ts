import { http } from './http'
import type { AuthResponse, Profile } from '../types'

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  fullName?: string
  password?: string
}

export const register = async (payload: RegisterPayload) => {
  const response = await http.post<AuthResponse>('/api/v1/auth/register', payload)
  return response.data
}

export const login = async (payload: LoginPayload) => {
  const response = await http.post<AuthResponse>('/api/v1/auth/login', payload)
  return response.data
}

export const getMe = async () => {
  const response = await http.get<Profile>('/api/v1/auth/me')
  return response.data
}

export const updateMe = async (payload: UpdateProfilePayload) => {
  const response = await http.patch<Profile>('/api/v1/auth/me', payload)
  return response.data
}

export const listUsersForRoleManagement = async () => {
  const response = await http.get<Profile[]>('/api/v1/auth/users')
  return response.data
}

export const changeUserRole = async (id: number, role: string) => {
  const response = await http.patch<Profile>(`/api/v1/auth/users/${id}/role`, { role })
  return response.data
}


