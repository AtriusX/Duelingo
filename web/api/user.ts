import { User } from './user';
import client from "./config"
import { ParsedUrlQueryInput } from "querystring"
import { address } from "../../env"
import { cast } from "../utils"
import { Error } from "../api"

export type User = {
    id: number
    username: string
    email: string
    joined: string
    language: string
    rank: number
    avatar?: string
    description?: string
}

export interface SearchQuery extends ParsedUrlQueryInput {
    query: string
    page?: number
}

// All of this is VERY rought right now, this will probably need to be changed later
export async function self(sessionToken?: string): Promise<User | null> {
    return fetch(`http://${address}:3000/user/me`, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionToken ?? "",
            'Secure': "true"
        }
    }).then(async u => !u ? u : await u.json())
}

export async function getUser(id?: string | string[]): Promise<User | Error> {
    return cast<User>(client.get(`/user/${id}`))
}

export async function search(data: any) {
    return cast<User[] | (number | User[])[]>(client.get(`/search${toQueryString(data)}`))
}

function toQueryString(data: object) {
    return `?${Object.entries(data).map(([k, v]) => `${k}=${v}`).join("&")}`
}

export interface UpdateInfo {
    username?: string
    email?: string
    password?: string
    confirm?: string
    description?: string
}

export async function update(user: UpdateInfo) {
    return client.post("/update", user)
}

export interface ConfirmationInfo {
    password: string
}

export async function deleteAccount(info: ConfirmationInfo) {
    return client.del("/user/me", info)
}
