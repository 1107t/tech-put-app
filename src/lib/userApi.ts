import { api, tokenStorage } from './api'
import type { User, GenderValue } from './userTypes'

export async function signup(params: {
  name: string
  email: string
  password: string
  birthday?: string
  gender?: GenderValue
}): Promise<User> {
  const res = await api.post<{ token: string; user: User }>('/auth/signup', params)
  tokenStorage.setUser(res.data.token)
  return res.data.user
}

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
  tokenStorage.setUser(res.data.token)
  return res.data.user
}

export async function logout(): Promise<void> {
  await api.delete('/auth/logout').catch(() => {})
  tokenStorage.removeUser()
}

export async function getCurrentUser(): Promise<User | null> {
  const token = tokenStorage.getUser()
  if (!token) return null
  try {
    const res = await api.get<{ user: User }>('/auth/me')
    return res.data.user
  } catch {
    tokenStorage.removeUser()
    return null
  }
}
