import { User } from '../entities/User';
import { EntityManager } from "@mikro-orm/core";
import { verify, hash } from 'argon2';
import { Error } from '.';

export interface UserInfo {
    email: string
    password: string
}

export async function login(
    em: EntityManager, 
    info: UserInfo
): Promise<User | Error> {
    const { email, password } = info
    const user = await em.findOne(User, { email })
    
    if (!user)
        return {
            message: "Email is incorrect!"
        }
    if (!await verify(user.password, password))
        return {
            message: "Password is incorrect!"
        }
    return user
}

export interface RegistrationInfo extends UserInfo {
    username: string
}

export async function register(
    em: EntityManager, 
    info: RegistrationInfo
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