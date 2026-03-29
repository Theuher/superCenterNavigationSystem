import { http } from './http'
import type { UserDetailsProfile } from '../types'

export interface UserProfilePayload {
  phoneNumber?: string
  bio?: string
  avatarUrl?: string
}

export const getMyDetailedProfile = async () => {
  const response = await http.get<UserDetailsProfile>('/api/v1/users/me')
  return response.data
}

export const updateMyDetailedProfile = async (payload: UserProfilePayload) => {
  const response = await http.put<UserDetailsProfile>('/api/v1/users/me', payload)
  return response.data
}


