// src/lib/adminApi.ts【修正】
// 管理者向けAPIクライアント。認証・ユーザー管理・つぶやき取得の関数を提供する。
// AdminArticle / AdminPost は対象ページ実装の別PRで追加する
import axios from 'axios'
import { api, tokenStorage } from './api'
import type { AdminUser } from './userTypes'
// つぶやきの型。関数内でのインラインimport（import('./tweets').Tweet）をやめ、ファイル先頭で1回だけimportする
import type { Tweet } from './tweets'

export interface Admin {
  id: string
  name: string
  email: string
  createdAt: string
}

// TODO: httpOnly Cookie 移行時に各関数内の tokenStorage.setXxx() / removeXxx() を削除する。
//   Rails がレスポンスで Set-Cookie するため、フロント側での token 保存・削除は不要になる。

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
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      tokenStorage.removeAdmin()
      return null
    }
    throw err
  }
}

export async function getUsers(): Promise<AdminUser[]> {
  const res = await api.get<{ users: AdminUser[] }>('/admin/users')
  return res.data.users
}

// 受講生1件の詳細を取得する。AdminUserTweetsPage で見出しのユーザー名表示に使用する
export async function getUser(userId: string): Promise<AdminUser> {
  const res = await api.get<{ user: AdminUser }>(`/admin/users/${userId}`)
  return res.data.user
}

// 受講生を削除する。DELETE /admin/users/:id を呼び出す
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`)
}

// 指定ユーザーのつぶやき一覧を管理者権限で取得する。
// 管理者は user_id を持たないためユーザー向けエンドポイントではなく専用の管理者エンドポイントを使う
export async function getAdminUserTweets(userId: string): Promise<Tweet[]> {
  const res = await api.get<{ tweets: Tweet[] }>(`/admin/users/${userId}/tweets`)
  return res.data.tweets
}
