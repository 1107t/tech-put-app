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

export const createCourse = async (value: string): Promise<Course> => {
  const response = await api.post<{ course: Course }>(
    '/admin/courses',
    { name: value }
  )

  return response.data.course
}

export async function updateCourse(id: string, name: string): Promise<Course> {
  const response = await api.patch<{ course: Course }>(`/admin/courses/${id}`, { name })
  return response.data.course

}

export const deleteCourse = async (id: string): Promise<void> => {
  await api.delete(`/admin/courses/${id}`)
}
