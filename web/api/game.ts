import client from "./config";

export async function acceptGame(id: number) {
    return client.post("/game/accept", { id })
}

export async function rejectGame(id: number) {
    return client.post("/game/reject", { id })
}