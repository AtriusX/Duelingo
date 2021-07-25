import { SessionData } from "express-session"

export type Language = "en" | "es" | "fr" | "cn"

type Func<A, B, C = void> = (a: A, b: B) => C

type Callback = (err: any, session: SessionData) => void

export type Option<T> = T | undefined

export type Handshake = {
  session: SessionData
  sessionStore: {
    get: Func<string, Callback>
  }
}

export const cast = <T = any>(value: unknown) => value as T
