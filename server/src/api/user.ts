import GameResult from "../entities/GameResult"
import { em } from "./../index"
import { Rivalry } from "./../entities/Rivalry"
import { testRequirements, emailFieldTest, basicFieldTest } from "."
import { hash } from "argon2"
import { User } from "../entities/User"
import { EntityManager, QueryOrder } from "@mikro-orm/core"
import { Error } from "../api/"
import { pending } from "./rival"
import ChallengeManager from "../network/ChallengeManager"

export type QueryRes = User[] | (number | User[])[]

export async function search(em: EntityManager, query: any): Promise<QueryRes> {
  if (query.query?.length === 0) return []
  return await em.findAndCount(
    User,
    {
      username: { $ilike: `%${query.query}%` },
      rank: { $gte: query.rank ?? 0 },
    },
    {
      orderBy: {
        username:
          query.order === "Descending" ? QueryOrder.DESC : QueryOrder.ASC,
      },
      offset: Math.max(0, query.page - 1) * 50 ?? 0,
      limit: 50,
    }
  )
}

export async function updateUser(
  em: EntityManager,
  up: User,
  userId: number
): Promise<Error | null> {
  try {
    const self = await em.findOne(User, { id: userId })
    if (!self) return { message: "No session found!" }
    const { username, email, password, language, description } = up
    if (testRequirements(username)) self.username = username
    if (testRequirements(email, emailFieldTest))
      self.email = email.toLowerCase()
    if (testRequirements(password, basicFieldTest(8)))
      self.password = await hash(password)
    if (language) self.language = language
    if (description) self.description = description
    await em.flush()
  } catch (_) {
    return { message: "Email is already in use!" }
  }
  return null
}

export type Update =
  | ({ type: "rivalry" } & NamedRivalry)
  | ({ type: "result" } & Result)

export type NamedRivalry = Rivalry & { id: number; username: string }

const cast = <T>(value: unknown) => value as T

type Result = {
  opponent?: User
  won?: boolean
  score: number
  time: number
}

export async function getGames(id: number, page?: number): Promise<Result[] | null> {
  let res = (await em.find(GameResult, { participantId: id }))
  if (!!page) 
    res = res.slice(page * 50, (page + 1) * 50)
  if (!res.length) return null
  let users = await em.find(User, [...new Set(res.map((r) => r.opponentId))])
  return res.map(({ opponentId, won, score, createdAt }) => {
    return {
      opponent: users.find(({ id }) => id === opponentId),
      won,
      score,
      time: createdAt.getTime(),
    }
  }).reverse()
}

export async function getUpdates(
  em: EntityManager,
  id: number,
  page: number
): Promise<Update[] | Error> {
  const rivals = await pending(em, id)
  if (!!cast<Error>(rivals)?.message) return rivals as Error
  // Get past rivals
  const rivalTypes = cast<NamedRivalry[]>(rivals).map((r) => {
    return { ...r, type: "rivalry" } as NamedRivalry & { type: "rivalry" }
  })
  const games = (await getGames(id))?.map(g => { 
    return { ...g, type: "result" } as Result & { type: "result" } 
  }) ?? []
  return [...rivalTypes, ...games].sort((a, b) => {
    const time = (r: Update) => r.type === "rivalry" ? r.createdAt.getTime() : r.time
    return time(b) - time(a)
  }).slice(page * 50, (page + 1) * 50)
}

export async function getChallenges(em: EntityManager, id: number) {
  return await em.find(
    User,
    ChallengeManager.get()
      .getChallengers(id)
      ?.map(([id]) => id) ?? []
  )
}

type Stats = {
  winRatio: number
  points: number
  nextRank: [number, number]
  rankedPlays: number
}

export function getRankPoints(points: number): [points: number, cap: number, rank: number] {
  if (points < 2500)
    return [points, 2500, 1]
    if (points < 10000)
    return [points - 2500, 7500, 2]
    if (points < 25000)
    return [points - 10000, 15000, 3]
    if (points < 50000)
      return [points - 25000, 25000, 4]
  return [0, 0, 5]
}

export async function getPoints(id: number): Promise<number> {
  return (await em.find(GameResult, { participantId: id }))
    .map(r => r.score)
    .reduce((a, b) => a + b)
}

export async function rankUp(id: number, rank: number) {
  let user = await em.findOne(User, id)
  if (user && user.rank !== rank) {
    user.rank = rank
    await em.flush()
  }
}

export async function getStates(id?: number): Promise<Stats | null> {
  if (!id)
    return null
  let res = await em.find(GameResult, { participantId: id })
  let points = res.map(r => r.score).reduce((a, b) => a + b)
  return {
    winRatio: Math.round((res.filter(r => r.won).length / res.length) * 100),
    points,
    nextRank: cast<[number, number]>(getRankPoints(points)),
    rankedPlays: res.length
  }
}