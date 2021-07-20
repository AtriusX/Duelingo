import client from "./config"
import { ParsedUrlQueryInput } from "querystring"
import { cast } from "../utils"
import { Error, User } from "../api"

export interface SearchQuery extends ParsedUrlQueryInput {
    query: string
    page?: number
}

export type QueryRes = User[] | (number | User[])[]

// All of this is VERY rought right now, this will probably need to be changed later
export async function self(sessionToken?: string): Promise<User | null> {
    return client.secureGet("/user/me", sessionToken ?? "")
}

export async function getUser(id?: string | string[]): Promise<User | Error> {
    return cast<User>(client.get(`/user/${id}`))
}

export async function search(data: any) {
    return cast<QueryRes>(client.get(`/search${toQueryString(data)}`))
}

function toQueryString(data: object) {
    return `?${Object.entries(data).map(([k, v]) => `${k}=${v}`).join("&")}`
}

export interface UpdateInfo {
    username?: string
    email?: string
    password?: string
    existing?: string
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
