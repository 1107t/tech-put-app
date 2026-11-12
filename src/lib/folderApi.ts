import { api } from './api'

export type Folder = {
  id: string
  name: string
  isDefault: boolean
  articlesCount: number
  createdAt: string
}

export async function fetchFolders(): Promise<Folder[]> {
  const response = await api.get<{ folders: Folder[] }>('/folders')
  return response.data.folders
}

export async function createFolder(name: string): Promise<Folder> {
  const response = await api.post<{ folder: Folder }>('/folders', { name })
  return response.data.folder
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  const response = await api.patch<{ folder: Folder }>(`/folders/${id}`, { name })
  return response.data.folder
}

export async function deleteFolder(id: string): Promise<void> {
  await api.delete(`/folders/${id}`)
}
