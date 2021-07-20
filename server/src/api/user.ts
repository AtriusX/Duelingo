import { Rivalry } from './../entities/Rivalry';
import { testRequirements, emailFieldTest, basicFieldTest } from '.';
import { hash } from 'argon2';
import { User } from '../entities/User';
import { EntityManager, QueryOrder } from '@mikro-orm/core';
import { Error } from "../api/"
import { pending } from './rival';

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

export async function updateUser(em: EntityManager, up: User, session: { userId: number }): Promise<Error | null> {
    try {
        const self = await em.findOne(User, { id: session.userId })
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

type UpdateType = {
    type: "rivalry" | "result"
}

export type NamedRivalry = Rivalry & { id: number; username: string }

const cast = <T>(value: unknown) => value as T

export async function getUpdates(em: EntityManager, id: number): Promise<(NamedRivalry & UpdateType)[] | Error> {
    const rivals = await pending(em, id)
    if (rivals instanceof Error)
        return rivals
    // Get past rivals
    const rivalTypes = cast<NamedRivalry[]>(rivals)
        .map(r => { return {...r, type: "rivalry" } as NamedRivalry & UpdateType })
    // TODO: Get past game results
    // TODO: Merge all and sort by date
    return rivalTypes
        .sort(r => r.createdAt.getMilliseconds())
}
