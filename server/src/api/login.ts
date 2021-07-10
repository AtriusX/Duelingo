import { User } from './../entities/User';
import { EntityManager } from "@mikro-orm/core";
import { verify } from 'argon2';
import Error from './error';

export interface UserInfo {
    email: string
    password: string
}

export default async function login(
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