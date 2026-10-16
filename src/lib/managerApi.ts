import axios from 'axios'
import { api, tokenStorage } from './api'

export interface Manager {
  id: string
  name: string
  email: string
  createdAt: string
}

// TODO: httpOnly Cookie 移行時に各関数内の tokenStorage.setXxx() / removeXxx() を削除する。
//   Rails がレスポンスで Set-Cookie するため、フロント側での token 保存・削除は不要になる。

export async function managerLogin(email: string, password: string): Promise<Manager> {
  const res = await api.post<{ token: string; manager: Manager }>('/manager/auth/login', { email, password })
  tokenStorage.setManager(res.data.token)
  return res.data.manager
}

export async function managerLogout(): Promise<void> {
  await api.delete('/manager/auth/logout').catch(() => {})
  tokenStorage.removeManager()
}

// TODO(manager): 担当ユーザー一覧・記事管理など業務 API をここに追加する
//   参考: adminApi.ts の getUsers() に倣った実装

export async function getCurrentManager(): Promise<Manager | null> {
  const token = tokenStorage.getManager()
  if (!token) return null
  try {
    const res = await api.get<{ manager: Manager }>('/manager/auth/me')
    return res.data.manager
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      tokenStorage.removeManager()
      return null
    }
    throw err
  }
}

export interface Tenant {
  id: string
  name: string
  createdAt: string
}

// テナントと同時に、そのテナントの最初の管理者アカウントを作成する
export interface TenantInput {
  name: string
  adminName: string
  adminEmail: string
  adminPassword: string
  adminPasswordConfirmation: string
}

export async function createTenant(data: TenantInput): Promise<Tenant> {
  const res = await api.post<{ tenant: Tenant }>('/manager/tenants', {
    name: data.name,
    admin_name: data.adminName,
    admin_email: data.adminEmail,
    admin_password: data.adminPassword,
    admin_password_confirmation: data.adminPasswordConfirmation,
  })
  return res.data.tenant
}

export async function getTenant(id: string): Promise<Tenant> {
  const res = await api.get<{ tenant: Tenant }>(`/manager/tenants/${id}`)
  return res.data.tenant
}

export async function getTenants(): Promise<Tenant[]> {
  const res = await api.get<{ tenants: Tenant[] }>('/manager/tenants')
  return res.data.tenants
}
