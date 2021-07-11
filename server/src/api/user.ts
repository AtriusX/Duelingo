import { User } from '../entities/User';
import { EntityManager } from '@mikro-orm/core';

export async function search(em: EntityManager, query: string): Promise<User[]> {
    if (query.length === 0)
        return [] 
    return em.find(User, {
        displayName: { $ilike: `%${query}%` }
    })
}