export type Role = 'ROLE_USER' | 'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN'

export interface Profile {
  id: number
  fullName: string
  email: string
  roles: Role[]
}

export interface UserDetailsProfile {
  email: string
  phoneNumber?: string
  bio?: string
  avatarUrl?: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: Profile
  roles: Role[]
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  categoryId: string
  locationId?: string
  floorPlanId?: string
  mapX?: number
  mapY?: number
  imageUrl?: string
}

export interface Location {
  id: string
  code: string
  zone: string
  aisle: string
  shelf: string
  floor: number
  floorPlanId: string
  mapX: number
  mapY: number
  note?: string
}

export interface FloorPlan {
  id: string
  name: string
  floor: number
  imageUrl: string
  note?: string
}




