// 管理者認証・ユーザー管理・投稿管理のAPIクライアント。
import axios from 'axios'
import { api, tokenStorage } from './api'
import type { AdminUser } from './userTypes'
import type { Tweet } from './tweets'

export interface Admin {
  id: string // 対象データのID
  name: string // 管理者名
  email: string // 管理者のメールアドレス
  createdAt: string // 登録日時（ISO 8601形式）
}

export interface AdminUserArticle {
  id: string              // 記事ID
  title: string           // 記事タイトル
  content: string         // 記事本文（一覧ではプレビュー表示に使う）
  userId: string | null   // 投稿者ID。詳細導線・デバッグ用に保持する
  createdAt: string       // 投稿日時（ISO 8601形式）
}

export interface AdminUserPost {
  id: string                 // 動画投稿ID
  title: string              // 動画タイトル
  body: string               // 動画の説明本文（一覧ではプレビュー表示に使う）
  youtubeUrl: string | null  // YouTubeのURL。未設定動画は null になるため null 許容とする
  createdAt: string          // 投稿日時（ISO 8601形式）
  userId: string | null      // 投稿者ID。詳細導線・デバッグ用に保持する
}

// TODO: httpOnly Cookie移行時にフロント側のトークン保存・削除を廃止する。
export async function adminLogin(email: string, password: string): Promise<Admin> {
  const response = await api.post<{ token: string; admin: Admin }>('/admin/auth/login', { email, password })
  tokenStorage.setAdmin(response.data.token)
  return response.data.admin
}

// APIが失敗しても手元のトークンは破棄する。
export async function adminLogout(): Promise<void> {
  await api.delete('/admin/auth/logout').catch(() => {})
  tokenStorage.removeAdmin()
}

// 401だけを未認証として扱い、通信失敗は呼び出し元へ返す。
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

export async function getUsers(): Promise<AdminUser[]> {
  const response = await api.get<{ users: AdminUser[] }>('/admin/users')
  return response.data.users
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const response = await api.get<{ user: AdminUser }>(`/admin/users/${id}`)
  return response.data.user
}

export async function getUser(userId: string): Promise<AdminUser> {
  return getAdminUser(userId)
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`)
}

// 管理者はuser_idを持たないため、受講生向けではなく管理者専用APIを使う。
export async function getAdminUserTweets(userId: string): Promise<Tweet[]> {
  const response = await api.get<{ tweets: Tweet[] }>(`/admin/users/${userId}/tweets`)
  return response.data.tweets
}

// 投稿日時の降順はAPI側で保証する。
export async function getAdminUserArticles(userId: string): Promise<AdminUserArticle[]> {
  const response = await api.get<{ articles: AdminUserArticle[] }>(`/admin/users/${userId}/articles`)
  return response.data.articles
}

// 投稿日時の降順はAPI側で保証する。
export async function getAdminUserPosts(userId: string): Promise<AdminUserPost[]> {
  const response = await api.get<{ posts: AdminUserPost[] }>(`/admin/users/${userId}/posts`)
  return response.data.posts
}

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

export async function getAdminPosts(): Promise<AdminPost[]> {
  const response = await api.get<{ posts: AdminPost[] }>('/admin/posts')
  return response.data.posts
}

export async function getAdminPost(id: string): Promise<AdminPost> {
  const response = await api.get<{ post: AdminPost }>(`/admin/posts/${id}`)
  return response.data.post
}

export async function createAdminPost(params: {
  title: string // 投稿タイトル
  body: string // 動画の説明本文
  youtube_url: string // APIへ送信するYouTube動画のURL
}): Promise<AdminPost> {
  const response = await api.post<{ post: AdminPost }>('/admin/posts', params)
  return response.data.post
}

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

export async function getAdminArticles(): Promise<AdminArticle[]> {
  const response = await api.get<{ articles: AdminArticle[] }>('/admin/articles')
  return response.data.articles
}

// 404は記事なしとして返し、通信失敗は呼び出し元へ返す。
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

export async function createAdminArticle(data: AdminArticleInput): Promise<string> {
  const response = await api.post<{ article: AdminArticle }>('/admin/articles', {
    title: data.title, sub_title: data.subTitle, content: data.content,
    article_type: data.articleType,
  })
  return response.data.article.id
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
