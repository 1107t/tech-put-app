import { api, tokenStorage } from './api'

export interface Manager {
  id: string
  name: string
  email: string
  createdAt: string
}

export async function managerLogin(email: string, password: string): Promise<Manager> {
  const res = await api.post<{ token: string; manager: Manager }>('/manager/auth/login', { email, password })
  tokenStorage.setManager(res.data.token)
  return res.data.manager
}

export async function managerLogout(): Promise<void> {
  await api.delete('/manager/auth/logout').catch(() => {})
  tokenStorage.removeManager()
}

export async function getCurrentManager(): Promise<Manager | null> {
  const token = tokenStorage.getManager()
  if (!token) return null
  try {
    const res = await api.get<{ manager: Manager }>('/manager/auth/me')
    return res.data.manager
  } catch {
    tokenStorage.removeManager()
    return null
  }
}
