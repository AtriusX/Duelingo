import client from "./config";

export async function create(receiver: number) {
    return client.post("/rival/create", { receiver })
}

export async function remove(receiver: number) {
    return client.post("/rival/remove", { receiver })
}

export async function get(receiver: number, token: string) {
    return client.secureGet(`/rival/${receiver}`, token)
}

export async function all(receiver?: string | string[]) {
    return client.get(`/rivals/all/${receiver}`)
}

export async function active(receiver?: string | string[]) {
    return client.get(`/rivals/active/${receiver}`)
}