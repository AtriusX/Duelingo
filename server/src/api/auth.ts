import { testRequirements, emailFieldTest, basicFieldTest } from '.';
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
    const user = await em.findOne(User, { email: { $ilike: email } })
    
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
    if (!testRequirements(username))
        return {
            message: "Username is invalid!"
        }
    if (!testRequirements(email, emailFieldTest))
        return {
            message: "Email is invalid!"
        }
    if (!testRequirements(password, basicFieldTest(8)))
        return {
            message: "Password is invalid!"
        }
    const code = await hash(password)
    const user = new User(username, email.toLowerCase(), code)    
    try {
        await em.persistAndFlush(user)
    } catch(_) {
        return {
            message: "Email already in use!"
        }
    }
    return user
}


export async function deleteUser(
    em: EntityManager,
    id: number,
    password: string
): Promise<Boolean | Error> {
    const user = await em.findOne(User, { id: id })
    if (!user || !await verify(user.password, password)) {
        return { message: "Failed to delete!" }
    }
    em.removeAndFlush(user)
    return true
}