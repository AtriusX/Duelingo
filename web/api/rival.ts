import { NamedRivalry } from './index';
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

export async function all(receiver?: number, page?: number) {
    return client.get<NamedRivalry[]>(`/rivals/all/${receiver}/${page}`)
}

export async function active(receiver?: number, page?: number) {
    return client.get<NamedRivalry[]>(`/rivals/active/${receiver}/${page}`)
}

export async function available(id: number) {
    return client.post<NamedRivalry[]>(`/rivals/available/${id}`)
}