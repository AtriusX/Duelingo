import { hash } from 'argon2';
import { User } from '../entities/User';
import { EntityManager } from '@mikro-orm/core';

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export async function search(em: EntityManager, query: string): Promise<User[]> {
    if (query.length === 0)
        return [] 
    return em.find(User, {
        username: { $ilike: `%${query}%` }
    })
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