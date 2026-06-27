// src/lib/tweetsStore.ts【修正】
// つぶやきデータのCRUD操作を行うストア。
// IndexedDB（localforage）からサーバーサイドAPIに移行した。
// 全データが Rails DB に保存されるため、管理者を含む全ロールからアクセス可能になった。
import { api } from './api'
import type { Tweet } from './tweets'

// GET /api/v1/tweets
// userId を渡すと特定ユーザーのつぶやきのみ取得する
export async function getTweets(userId?: string): Promise<Tweet[]> {
  const params = userId ? { user_id: userId } : {}
  const response = await api.get<{ tweets: Tweet[] }>('/tweets', { params })
  return response.data.tweets
}

// POST /api/v1/tweets
// 画像がある場合は multipart/form-data で送信する
export async function createTweet(content: string, images?: File[]): Promise<Tweet> {
  const formData = new FormData()
  formData.append('content', content)
  // 画像ファイルを images[] キーで配列送信する
  if (images && images.length > 0) {
    images.forEach((imageFile) => formData.append('images[]', imageFile))
  }
  const response = await api.post<{ tweet: Tweet }>('/tweets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.tweet
}

// DELETE /api/v1/tweets/:id
export async function deleteTweet(id: string): Promise<void> {
  await api.delete(`/tweets/${id}`)
}

// PATCH /api/v1/tweets/:id
export async function updateTweet(id: string, content: string): Promise<Tweet> {
  const response = await api.patch<{ tweet: Tweet }>(`/tweets/${id}`, { content })
  return response.data.tweet
}

// POST /api/v1/tweets/:id/like
// いいねを付ける。二重いいねはサーバー側で弾く
export async function likeTweet(id: string): Promise<void> {
  await api.post(`/tweets/${id}/like`)
}

// DELETE /api/v1/tweets/:id/like
// いいねを解除する
export async function unlikeTweet(id: string): Promise<void> {
  await api.delete(`/tweets/${id}/like`)
}

// POST /api/v1/tweets/:id/comments
// コメントを投稿する
export async function addComment(tweetId: string, content: string): Promise<void> {
  await api.post(`/tweets/${tweetId}/comments`, { content })
}
