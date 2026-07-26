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

export type AdminArticle = {
  id: string
  title: string
  subTitle: string
  content: string
  articleType: string | null
  userId: string | null
  adminId: string | null
  createdAt: string
  updatedAt: string
}

export type AdminArticleInput = {
  title: string
  subTitle: string
  content: string
  articleType: string
}

export async function getAdminArticles(): Promise<AdminArticle[]> {
  const res = await api.get<{ articles: AdminArticle[] }>('/admin/articles')
  return res.data.articles
}

export async function getAdminArticle(id: string): Promise<AdminArticle | undefined> {
  try {
    const res = await api.get<{ article: AdminArticle }>(`/admin/articles/${id}`)
    return res.data.article
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return undefined
    }
    throw err
  }
}

export async function createAdminArticle(data: AdminArticleInput): Promise<string> {
  const res = await api.post<{ article: AdminArticle }>('/admin/articles', {
    title: data.title, sub_title: data.subTitle, content: data.content,
    article_type: data.articleType,
  })
  return res.data.article.id
}

export async function updateAdminArticle(id: string, data: AdminArticleInput): Promise<void> {
  await api.patch(`/admin/articles/${id}`, {
    title: data.title, sub_title: data.subTitle, content: data.content,
    article_type: data.articleType,
  })
}

export async function deleteAdminArticle(id: string): Promise<void> {
  await api.delete(`/admin/articles/${id}`)
}
