// src/lib/adminApi.ts【修正】
// 管理者向けAPIクライアント。認証・ユーザー管理・つぶやき/記事/動画取得の関数を提供する。
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

// 管理者が閲覧する受講生別記事の型。受講生別記事一覧ページ（AdminUserArticlesPage）で使用する
// ※main に管理者記事CRUD用の別の AdminArticle 型があるため、衝突回避で AdminUserArticle に改名（受講生の記事の意）
export interface AdminUserArticle {
  id: string              // 記事ID
  title: string           // 記事タイトル
  content: string         // 記事本文（一覧ではプレビュー表示に使う）
  userId: string | null   // 投稿者ID。詳細導線・デバッグ用に保持する
  createdAt: string       // 投稿日時（ISO 8601形式）
}

// 管理者が閲覧する受講生別動画投稿の型。受講生別動画投稿一覧ページ（AdminUserPostsPage）で使用する
export interface AdminUserPost {
  id: string                 // 動画投稿ID
  title: string              // 動画タイトル
  body: string               // 動画の説明本文（一覧ではプレビュー表示に使う）
  youtubeUrl: string | null  // YouTubeのURL。未設定動画は null になるため null 許容とする
  createdAt: string          // 投稿日時（ISO 8601形式）
  userId: string | null      // 投稿者ID。詳細導線・デバッグ用に保持する
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

// 指定ユーザーの記事一覧を管理者権限で取得する。
// GET /admin/users/:userId/articles を呼び出す。並び順（createdAt desc）はAPI側で保証する
export async function getAdminUserArticles(userId: string): Promise<AdminUserArticle[]> {
  const res = await api.get<{ articles: AdminUserArticle[] }>(`/admin/users/${userId}/articles`)
  return res.data.articles
}

// 指定ユーザーの動画投稿一覧を管理者権限で取得する。
// GET /admin/users/:userId/posts を呼び出す。並び順（createdAt desc）はAPI側で保証する
export async function getAdminUserPosts(userId: string): Promise<AdminUserPost[]> {
  const res = await api.get<{ posts: AdminUserPost[] }>(`/admin/users/${userId}/posts`)
  return res.data.posts
}

// ここから下は管理者記事CRUD機能（別PR #23 で origin/main にマージ済み）。受講生別の閲覧機能とは別物。
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
