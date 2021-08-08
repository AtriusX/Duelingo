import { User } from '.';
import client  from "./config";

export type Snapshot = {
    user?: User
	id: number
	score: number
	rank: number
}

export async function getLeaderboards(): Promise<Snapshot[]> {
    return await client.get("/leaderboards")
}