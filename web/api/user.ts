import client from "./config"
import { ParsedUrlQueryInput } from "querystring"
import { address } from "../../env"

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
export async function self(sessionToken: string | undefined) {
    return fetch(`http://${address}:3000/user/me`, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionToken ?? "",
            'Secure': "true"
        }
    }).then(async u => await u.json())
}

export async function getUser(id?: string | string[]): Promise<object | Error> {
    return client.get(`/user/${id}`)
}

export async function search(data: any) {
    return client.get(`/search${toQuery(data)}`) as unknown as User[] | (number | User[])[]
}

function toQuery(data: object) {
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