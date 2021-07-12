import client from "./config"
import { ParsedUrlQueryInput } from "querystring"
import { address } from "../../env"
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

export async function search(query: SearchQuery): Promise<any[]> {
    return client.get(`/search?query=${query.query}`) as unknown as any[]
}

export async function update(username?: string, email?: string, password?: string) {
    return client.post("/update", {
        displayName: username, email, password: password?.length === 0 ? undefined : password
    })
}