export const Gender = {
  Unset: 0,
  Male: 1,
  Female: 2,
} as const

export type GenderValue = (typeof Gender)[keyof typeof Gender]

export const genderLabel = (v: GenderValue | null | undefined): string => {
  switch (v) {
    case Gender.Male:   return '男性'
    case Gender.Female: return '女性'
    default:            return '未設定'
  }
}

export type User = {
  id: string
  name: string
  email: string
  birthday: string | null
  gender: GenderValue | null
  createdAt: string
}
