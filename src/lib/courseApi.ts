import {api} from './api'

//Courseモデルの型を指定
export type Course = {
  id: string;
  name: string;
};

export async function getCourses(): Promise<Course[]> {
  const response = await api.get<{ courses: Course[] }>(
    '/admin/courses'
  )

  return response.data.courses
}

export const NewCourse = async (value: string): Promise<void> => {
  await api.post('/admin/courses', {
    name: value
  })

}

export async function updateCourse(id: string, name: string): Promise<void> {
  await api.patch(`/admin/courses/${id}`, { name })
}

export const DeletCourse = async (id: string): Promise<void> => {
  await api.delete(`/admin/courses/${id}`)
}
