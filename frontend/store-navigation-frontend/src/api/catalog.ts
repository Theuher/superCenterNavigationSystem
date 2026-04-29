import { http } from './http'
import type { Category, Product, Location, FloorPlan } from '../types'

export const listCategories = async () => {
  const response = await http.get<Category[]>('/api/v1/categories')
  return response.data
}

export const createCategory = async (payload: { name: string; description?: string }) => {
  const response = await http.post<Category>('/api/v1/categories', payload)
  return response.data
}

export const updateCategory = async (id: string, payload: { name: string; description?: string }) => {
  const response = await http.put<Category>(`/api/v1/categories/${id}`, payload)
  return response.data
}

export const deleteCategory = async (id: string) => {
  await http.delete(`/api/v1/categories/${id}`)
}

export const listProducts = async (q?: string, categoryId?: string) => {
  const response = await http.get<Product[]>('/api/v1/products', {
    params: { q, categoryId },
  })
  return response.data
}

export const createProduct = async (payload: Omit<Product, 'id'>) => {
  console.log(payload)
  const response = await http.post<Product>('/api/v1/products', payload)
  return response.data
}

export const updateProduct = async (id: string, payload: Omit<Product, 'id'>) => {
  const response = await http.put<Product>(`/api/v1/products/${id}`, payload)
  return response.data
}

export const deleteProduct = async (id: string) => {
  await http.delete(`/api/v1/products/${id}`)
}

export const listLocations = async () => {
  const response = await http.get<Location[]>('/api/v1/locations')
  return response.data
}

export const createLocation = async (payload: Omit<Location, 'id'>) => {
  const response = await http.post<Location>('/api/v1/locations', payload)
  return response.data
}

export const updateLocation = async (id: string, payload: Omit<Location, 'id'>) => {
  const response = await http.put<Location>(`/api/v1/locations/${id}`, payload)
  return response.data
}

export const deleteLocation = async (id: string) => {
  await http.delete(`/api/v1/locations/${id}`)
}

export const listFloorPlans = async () => {
  const response = await http.get<FloorPlan[]>('/api/v1/floor-plans')
  return response.data
}

export const createFloorPlan = async (payload: Omit<FloorPlan, 'id'>) => {
  const response = await http.post<FloorPlan>('/api/v1/floor-plans', payload)
  return response.data
}

export const updateFloorPlan = async (id: string, payload: Omit<FloorPlan, 'id'>) => {
  const response = await http.put<FloorPlan>(`/api/v1/floor-plans/${id}`, payload)
  return response.data
}

export const deleteFloorPlan = async (id: string) => {
  await http.delete(`/api/v1/floor-plans/${id}`)
}



