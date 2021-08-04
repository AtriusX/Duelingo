import { User } from ".";
import client from "./config";

export async function acceptGame(id: number) {
    return client.post("/game/accept", { id })
}

export async function rejectGame(id: number) {
    return client.post("/game/reject", { id })
}

export async function cancelChallenge(id: number) {
    return client.post("/challenge/cancel", { id })
}

export async function getChallengers(id: number) {
    return client.post("/challengers", { id })
}

export async function getOpponent(self: number, gameId: string): Promise<User | null> {
    return client.post("/game/opponent", { self, gameId })
}

export async function getGameState(gameId: string): Promise<[number, number, boolean, number] | null> {
    return client.post("/game/state", { gameId })
}