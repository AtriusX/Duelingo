export interface Error {
  message: string
}

export type User = {
  id: number
  username: string
  email: string
  joined: string
  language: string
  rank: number
  avatar?: string
  description?: string
}

export type Rivalry = {
  sender?: number
  receiver?: number
  active: boolean
  createdAt: Date
}

export type NamedRivalry = Rivalry & { id: number; username: string }

export type Setter<T> = (value: T) => void

export type Option<T> = T | null
