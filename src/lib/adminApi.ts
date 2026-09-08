// src/lib/adminApi.ts【修正】
// 管理者向けAPIクライアント。認証・ユーザー管理・受講生別の投稿取得・動画/記事CRUDの関数を提供する。
import axios from 'axios'
import { api, tokenStorage } from './api'
import type { AdminUser } from './userTypes'
// つぶやきの型。関数内でのインラインimport（import('./tweets').Tweet）をやめ、ファイル先頭で1回だけimportする
import type { Tweet } from './tweets'

export interface Admin {
  id: string // 対象データのID
  name: string // 管理者名
  email: string // 管理者のメールアドレス
  createdAt: string // 登録日時（ISO 8601形式）
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

// 認証に成功した管理者とトークンを保存する。
export async function adminLogin(email: string, password: string): Promise<Admin> {
  const response = await api.post<{ token: string; admin: Admin }>('/admin/auth/login', { email, password })
  tokenStorage.setAdmin(response.data.token)
  return response.data.admin
}

// ログアウトAPIの結果にかかわらず手元のトークンを削除する。
export async function adminLogout(): Promise<void> {
  await api.delete('/admin/auth/logout').catch(() => {})
  tokenStorage.removeAdmin()
}

// 現在の管理者を確認する。401だけを未認証として扱い、通信失敗は呼び出し元へ返す。
export async function getCurrentAdmin(): Promise<Admin | null> {
  const token = tokenStorage.getAdmin()
  if (!token) return null
  try {
    const response = await api.get<{ admin: Admin }>('/admin/auth/me')
    return response.data.admin
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.removeAdmin()
      return null
    }
    throw error
  }
}

// 登録ユーザー一覧を取得する。
export async function getUsers(): Promise<AdminUser[]> {
  const response = await api.get<{ users: AdminUser[] }>('/admin/users')
  return response.data.users
}

// 管理者向け受講生詳細APIを呼び出す。
export async function getAdminUser(id: string): Promise<AdminUser> {
  const response = await api.get<{ user: AdminUser }>(`/admin/users/${id}`)
  return response.data.user
}

// 受講生1件の詳細を取得する。AdminUserTweetsPage で見出しのユーザー名表示に使用する
export async function getUser(userId: string): Promise<AdminUser> {
  return getAdminUser(userId)
}

// 受講生を削除する。DELETE /admin/users/:id を呼び出す
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`)
}

// 指定ユーザーのつぶやき一覧を管理者権限で取得する。
// 管理者は user_id を持たないためユーザー向けエンドポイントではなく専用の管理者エンドポイントを使う
export async function getAdminUserTweets(userId: string): Promise<Tweet[]> {
  const response = await api.get<{ tweets: Tweet[] }>(`/admin/users/${userId}/tweets`)
  return response.data.tweets
}

// 指定ユーザーの記事一覧を管理者権限で取得する。
// GET /admin/users/:userId/articles を呼び出す。並び順（createdAt desc）はAPI側で保証する
export async function getAdminUserArticles(userId: string): Promise<AdminUserArticle[]> {
  const response = await api.get<{ articles: AdminUserArticle[] }>(`/admin/users/${userId}/articles`)
  return response.data.articles
}

// 指定ユーザーの動画投稿一覧を管理者権限で取得する。
// GET /admin/users/:userId/posts を呼び出す。並び順（createdAt desc）はAPI側で保証する
export async function getAdminUserPosts(userId: string): Promise<AdminUserPost[]> {
  const response = await api.get<{ posts: AdminUserPost[] }>(`/admin/users/${userId}/posts`)
  return response.data.posts
}

// ここから下は全体の動画・記事管理機能。受講生別の投稿一覧と併存する。
export interface AdminPost {
  id: string // 対象データのID
  title: string // 投稿タイトル
  body: string // 動画の説明本文
  youtubeUrl: string // YouTube動画のURL
  adminId: string | null // 投稿した管理者のID
  userId: string | null // 投稿した受講生のID
  posterName: string | null // 一覧に表示する投稿者名
  createdAt: string // 登録日時（ISO 8601形式）
  updatedAt: string // 最終更新日時（ISO 8601形式）
}

// 全投稿者の動画一覧を取得する。
export async function getAdminPosts(): Promise<AdminPost[]> {
  const response = await api.get<{ posts: AdminPost[] }>('/admin/posts')
  return response.data.posts
}

// 指定した動画投稿の詳細を取得する。
export async function getAdminPost(id: string): Promise<AdminPost> {
  const response = await api.get<{ post: AdminPost }>(`/admin/posts/${id}`)
  return response.data.post
}

// 管理者の動画投稿を作成する。
export async function createAdminPost(params: {
  title: string // 投稿タイトル
  body: string // 動画の説明本文
  youtube_url: string // APIへ送信するYouTube動画のURL
}): Promise<AdminPost> {
  const response = await api.post<{ post: AdminPost }>('/admin/posts', params)
  return response.data.post
}

// 指定した動画投稿を削除する。
export async function deleteAdminPost(id: string): Promise<void> {
  await api.delete(`/admin/posts/${id}`)
}

export type AdminArticle = {
  id: string // 対象データのID
  title: string // 投稿タイトル
  subTitle: string // 記事のサブタイトル
  content: string // 記事本文
  articleType: string | null // 記事の種類
  userId: string | null // 投稿した受講生のID
  adminId: string | null // 投稿した管理者のID
  createdAt: string // 登録日時（ISO 8601形式）
  updatedAt: string // 最終更新日時（ISO 8601形式）
}

export type AdminArticleInput = {
  title: string // 投稿タイトル
  subTitle: string // 記事のサブタイトル
  content: string // 記事本文
  articleType: string // 記事の種類
}

// 全投稿者の記事一覧を取得する。
export async function getAdminArticles(): Promise<AdminArticle[]> {
  const response = await api.get<{ articles: AdminArticle[] }>('/admin/articles')
  return response.data.articles
}

// 記事詳細を取得し、存在しない記事はundefinedとして返す。
export async function getAdminArticle(id: string): Promise<AdminArticle | undefined> {
  try {
    const response = await api.get<{ article: AdminArticle }>(`/admin/articles/${id}`)
    return response.data.article
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined
    }
    throw error
  }
}

// 画面の入力値をAPIのキーへ変換して記事を作成する。
export async function createAdminArticle(data: AdminArticleInput): Promise<string> {
  const response = await api.post<{ article: AdminArticle }>('/admin/articles', {
    title: data.title, sub_title: data.subTitle, content: data.content,
    article_type: data.articleType,
  })
  return response.data.article.id
}

// 画面の入力値をAPIのキーへ変換して記事を更新する。
export async function updateAdminArticle(id: string, data: AdminArticleInput): Promise<void> {
  await api.patch(`/admin/articles/${id}`, {
    title: data.title, sub_title: data.subTitle, content: data.content,
    article_type: data.articleType,
  })
}

// 指定した記事を削除する。
export async function deleteAdminArticle(id: string): Promise<void> {
  await api.delete(`/admin/articles/${id}`)
}
