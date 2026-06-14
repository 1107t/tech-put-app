import axios from 'axios'
import { api, tokenStorage } from './api'
import type { AdminUser } from './userTypes'

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

export interface AdminPost {
  id: string
  title: string
  body: string
  youtubeUrl: string
  adminId: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const res = await api.get<{ posts: AdminPost[] }>('/admin/posts')
  return res.data.posts
}

export async function createAdminPost(params: {
  title: string
  body: string
  youtube_url: string
}): Promise<AdminPost> {
  const res = await api.post<{ post: AdminPost }>('/admin/posts', params)
  return res.data.post
}
