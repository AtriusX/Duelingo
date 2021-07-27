import { Rivalry } from './../entities/Rivalry';
import { testRequirements, emailFieldTest, basicFieldTest } from '.';
import { hash } from 'argon2';
import { User } from '../entities/User';
import { EntityManager, QueryOrder } from '@mikro-orm/core';
import { Error } from "../api/"
import { pending } from './rival';
import ChallengeManager from '../network/ChallengeManager';

export type QueryRes = User[] | (number | User[])[]

export async function search(em: EntityManager, query: any): Promise<QueryRes> {
    if (query.query?.length === 0)
        return [] 
    return await em.findAndCount(User, {
        username: { $ilike: `%${query.query}%` },
        rank: { $gte: query.rank ?? 0 }
    }, {
        orderBy: { username: query.order === "Descending" ? QueryOrder.DESC : QueryOrder.ASC },
        offset: Math.max(0, query.page - 1) * 50 ?? 0,
        limit: 50
    })
}

export async function updateUser(em: EntityManager, up: User, userId: number): Promise<Error | null> {
    try {
        const self = await em.findOne(User, { id: userId })
        if (!self) 
            return { message: "No session found!" }
        const { username, email, password, language, description } = up
            if (testRequirements(username))
                self.username = username
            if (testRequirements(email, emailFieldTest))
                self.email = email.toLowerCase()
            if (testRequirements(password, basicFieldTest(8)))
                self.password = await hash(password)
            if (language)
                self.language = language
            if (description)
                self.description = description
            await em.flush()
    } catch (_) {        
        return { message: "Email is already in use!" }
    }
    return null
}

type GameResult = {}

export type Update = 
    { type: "rivalry" } & NamedRivalry | 
    { type: "result" } & GameResult |
    { type: "challenge" } & User

export type NamedRivalry = Rivalry & { id: number; username: string }

const cast = <T>(value: unknown) => value as T

export async function getUpdates(em: EntityManager, id: number): Promise<Update[] | Error> {
    const rivals = await pending(em, id)
    if (!!cast<Error>(rivals)?.message)
        return rivals as Error
    // Get past rivals
    const rivalTypes = cast<NamedRivalry[]>(rivals)
        .map(r => { return {...r, type: "rivalry" } as NamedRivalry & Update })
    const users = cast<Update[]>((await getChallenges(em, id))
        .map(({ password: _, ...user }) => { return { type: "challenge", ...user } }))
    // TODO: Get past game results
    // TODO: Merge all and sort by date
    return [...users, ...rivalTypes.sort(r => -r.createdAt.getTime())]
}

export async function getChallenges(em: EntityManager, id: number) {
    return (await em.find(User, ChallengeManager.get().getChallengers(id)
        ?.map(([id]) => id) ?? []))
}