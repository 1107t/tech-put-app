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
