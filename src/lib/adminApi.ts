import { api, tokenStorage } from './api'
import type { User } from './userTypes'

export interface Admin {
  id: string
  name: string
  email: string
  createdAt: string
}

export async function adminLogin(email: string, password: string): Promise<Admin> {
  const res = await api.post<{ token: string; admin: Admin }>('/admin/auth/login', { email, password })
  tokenStorage.setAdmin(res.data.token)
  return res.data.admin
}

export async function adminLogout(): Promise<void> {
  await api.delete('/admin/auth/logout').catch(() => {})
  tokenStorage.removeAdmin()
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const token = tokenStorage.getAdmin()
  if (!token) return null
  try {
    const res = await api.get<{ admin: Admin }>('/admin/auth/me')
    return res.data.admin
  } catch {
    tokenStorage.removeAdmin()
    return null
  }
}

export async function getUsers(): Promise<User[]> {
  const res = await api.get<{ users: User[] }>('/admin/users')
  return res.data.users
}
