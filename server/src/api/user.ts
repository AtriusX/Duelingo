import { hash } from 'argon2';
import { User } from '../entities/User';
import { EntityManager, QueryOrder } from '@mikro-orm/core';

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export async function search(em: EntityManager, query: any): Promise<User[]> {
    if (query.query.length === 0)
        return [] 
    const value = getValue(query.rank)
    return em.find(User, {
        username: { $ilike: `%${query.query}%` }
    }, {
        orderBy: { username: query.order === "Descending" ? QueryOrder.DESC : QueryOrder.ASC }
    }).then(u => u.filter(v => { // This might need to be changed later
        const row = getValue(v.rank)
        return  value == -1 || row <= value
    }))
}

function getValue(rank: String) {
    return "SABCD".indexOf(rank.toUpperCase())
}

export async function updateUser(em: EntityManager, up: User, session: { userId: number }): Promise<boolean> {
    const self = await em.findOne(User, { id: session.userId })
    if (!self) 
        return false
    const { username, email, password, language, description } = up
    if (username)
        self.username = username
    if (email && email.match(emailRegex))
        self.email = email
    if (password)
        self.password = await hash(password)
    if (language)
        self.language = language
    if (description)
        self.description = description
    em.flush()
    return true
}