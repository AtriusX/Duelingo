import { User } from './../entities/User';
import { EntityManager } from "@mikro-orm/core";
import { hash } from 'argon2';
import Error from './error';

export interface UserInfo {
    username: string
    email: string
    password: string
}

export default async function register(
    em: EntityManager, 
    info: UserInfo
): Promise<User | Error> {
    const { username, email, password } = info
    if (!username)
        return {
            message: "Username is empty!"
        }
    if (!email)
        return {
            message: "Email is empty!"
        }
    if (!password)
        return {
            message: "Password is empty!"
        }
    const code = await hash(password)
    const user = new User(username, email, code)    
    try {
        await em.persistAndFlush(user)
    } catch(_) {
        return {
            message: "Email already in use!"
        }
    }
    return user
}