// src/lib/adminApi.ts【修正】
// 管理者向けAPIクライアント。認証・ユーザー管理・記事・動画投稿の取得関数を提供する。
import axios from 'axios'
import { api, tokenStorage } from './api'
import type { AdminUser } from './userTypes'

// 管理者が取得する記事の型（全受講生・管理者の投稿を含む）
export type AdminArticle = {
  id: string
  title: string           // 記事タイトル
  subTitle: string        // サブタイトル
  content: string         // 本文
  articleType: string | null  // 記事種別（任意）
  image: string | null    // サムネイル画像URL（任意）
  userId: string | null   // 受講生が投稿した場合のユーザーID（管理者投稿の場合はnull）
  adminId: string | null  // 管理者が投稿した場合の管理者ID（受講生投稿の場合はnull）
  createdAt: string       // ISO 8601形式の投稿日時
  updatedAt: string       // ISO 8601形式の更新日時
}

// 管理者が取得する動画投稿の型（全受講生・管理者の投稿を含む）
export type AdminPost = {
  id: string
  title: string           // 投稿タイトル
  body: string            // 本文・説明文
  youtubeUrl: string | null  // YouTubeの動画URL（任意）
  userId: string | null   // 受講生が投稿した場合のユーザーID（管理者投稿の場合はnull）
  adminId: string | null  // 管理者が投稿した場合の管理者ID（受講生投稿の場合はnull）
  createdAt: string       // ISO 8601形式の投稿日時
  updatedAt: string       // ISO 8601形式の更新日時
}

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

// 受講生1件の詳細を取得する。詳細ページで使用する
export async function getUser(userId: string): Promise<AdminUser> {
  const res = await api.get<{ user: AdminUser }>(`/admin/users/${userId}`)
  return res.data.user
}

// 受講生を削除する。DELETE /admin/users/:id を呼び出す
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`)
}

// 全記事一覧を取得する。管理者・受講生の投稿を問わず全件返す
export async function getAdminArticles(): Promise<AdminArticle[]> {
  const res = await api.get<{ articles: AdminArticle[] }>('/admin/articles')
  return res.data.articles
}

// 全動画投稿一覧を取得する。管理者・受講生の投稿を問わず全件返す
export async function getAdminPosts(): Promise<AdminPost[]> {
  const res = await api.get<{ posts: AdminPost[] }>('/admin/posts')
  return res.data.posts
}

// 指定ユーザーのつぶやき一覧を管理者権限で取得する。
// 管理者は user_id を持たないためユーザー向けエンドポイントではなく専用の管理者エンドポイントを使う
export async function getAdminUserTweets(userId: string): Promise<import('./tweets').Tweet[]> {
  const res = await api.get<{ tweets: import('./tweets').Tweet[] }>(`/admin/users/${userId}/tweets`)
  return res.data.tweets
}
