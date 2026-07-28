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

// ここから下は管理者記事CRUD機能（別PR #23 で origin/main にマージ済み）。
// PR #21 のつぶやき用関数と追加位置が重なったためコンフリクトしたが、内容は独立なので両方を残す。
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
