import { User } from "."
import client from "./config"

export async function acceptGame(id: number) {
  return client.post("/game/accept", { id })
}

export async function rejectGame(id: number) {
  return client.post("/game/reject", { id })
}

export async function cancelChallenge(id: number) {
  return client.post("/challenge/cancel", { id })
}

export async function getChallengers(id: number) {
  return client.post("/challengers", { id })
}

export async function getOpponent(
  self: number,
  gameId: string
): Promise<User | null> {
  return client.post("/game/opponent", { self, gameId })
}

export interface Player {
  id: number
  score: number
  streak: number
}

export interface PublicQuestion {
  question: string
  choices: string[]
}

export async function getGameState(
  gameId: string
): Promise<[Player, Player, boolean, [number, number?], PublicQuestion?] | null> {
  return client.post("/game/state", { gameId })
}
