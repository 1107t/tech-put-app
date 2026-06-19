import axios from 'axios'
import { api } from './api'

export type ArticleInput = {
  title: string
  subTitle: string
  content: string
}

export type Article = {
  id: string
  title: string
  subTitle: string
  content: string
  userId: string | null   // 受講生が投稿した場合にセット。管理者投稿の場合はnull
  adminId: string | null  // 管理者が投稿した場合にセット。受講生投稿の場合はnull
  createdAt: string
  updatedAt: string
}

export async function createArticle(data: ArticleInput): Promise<string> {
  const res = await api.post<{ article: Article }>('/articles', {
    // Rails側のカラム名がsnake_caseのためsubTitleをsub_titleに変換して送信
    title: data.title, sub_title: data.subTitle, content: data.content,
  })
  return res.data.article.id
}

export async function getAllArticles(): Promise<Article[]> {
  const res = await api.get<{ articles: Article[] }>('/articles')
  return res.data.articles
}

export async function getArticle(id: string): Promise<Article | undefined> {
  try {
    const res = await api.get<{ article: Article }>(`/articles/${id}`)
    return res.data.article
  } catch (err) {
    // 404は「記事が存在しない」ため呼び出し側でハンドリングできるようundefinedを返す
    // それ以外（500・ネットワーク断等）はサーバー障害のためthrowして呼び出し側でエラー表示する
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return undefined
    }
    throw err
  }
}

export async function updateArticle(id: string, data: ArticleInput): Promise<void> {
  await api.patch(`/articles/${id}`, {
    title: data.title, sub_title: data.subTitle, content: data.content,
  })
}

export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/articles/${id}`)
}
