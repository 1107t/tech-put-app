import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

// トークンのストレージキー
export const TOKEN_KEYS = {
  user: 'user_token',
  admin: 'admin_token',
  manager: 'manager_token',
} as const

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// リクエスト時にトークンを自動付与（ユーザー→管理者→マネージャーの優先順位）
api.interceptors.request.use((config) => {
  const userToken    = localStorage.getItem(TOKEN_KEYS.user)
  const adminToken   = localStorage.getItem(TOKEN_KEYS.admin)
  const managerToken = localStorage.getItem(TOKEN_KEYS.manager)
  const token = userToken ?? adminToken ?? managerToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 レスポンス時に全トークンを削除してログインページへリダイレクト
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url ?? ''
      const isAdmin = url.includes('/admin/')
      const isManager = url.includes('/manager/')
      tokenStorage.clearAll()
      if (isAdmin) {
        window.location.href = '/admin/login'
      } else if (isManager) {
        window.location.href = '/manager/login'
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ロール別の api インスタンス（ヘッダーを明示的に指定したい場合に使用）
export function apiWithToken(token: string) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

// トークン操作ユーティリティ
export const tokenStorage = {
  getUser:    ()          => localStorage.getItem(TOKEN_KEYS.user),
  setUser:    (t: string) => localStorage.setItem(TOKEN_KEYS.user, t),
  removeUser: ()          => localStorage.removeItem(TOKEN_KEYS.user),

  getAdmin:    ()          => localStorage.getItem(TOKEN_KEYS.admin),
  setAdmin:    (t: string) => localStorage.setItem(TOKEN_KEYS.admin, t),
  removeAdmin: ()          => localStorage.removeItem(TOKEN_KEYS.admin),

  getManager:    ()          => localStorage.getItem(TOKEN_KEYS.manager),
  setManager:    (t: string) => localStorage.setItem(TOKEN_KEYS.manager, t),
  removeManager: ()          => localStorage.removeItem(TOKEN_KEYS.manager),

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEYS.user)
    localStorage.removeItem(TOKEN_KEYS.admin)
    localStorage.removeItem(TOKEN_KEYS.manager)
  },
}
