import { Express, Request, Response } from 'express';
import chalk from 'chalk';
import { EntityManager, MikroORM } from "@mikro-orm/core"
import LeaderboardSnapshot from '../entities/LeaderboardSnapshot';
import GameResult from '../entities/GameResult';
import { User } from '../entities/User';

type Snapshot = {
	id: number
	score: number
	rank: number
}

export function setupLeaderboards(app: Express, { em }: MikroORM, period: number = 60 * 60 * 1000) {
  const process = async () => {
    // Leaderboard setup process
		notice("Running leaderboard update...")
		// Clear old leaderboard
    await clear(em)
		// Get, reduce, and filter data
		let vals = await getValues(em)
		// Process values into leaderboards
		let out = processValues(vals)
		// Push to database
		await persist(em, out)
		notice("Process has completed!")
  }
  process()
  setInterval(process, Math.min(60 * 60 * 1000, period))
	setupLeaderboardEndpoints(app, em)
}

function setupLeaderboardEndpoints(app: Express, em: EntityManager) {
	app.get("/leaderboards", async (_: Request, res: Response) => {
		let snapshots = await getSnapshots(em)
		let users = await em.find(User, snapshots.map(s => s.userId))
		let out = snapshots.map(s => { 
			return { 
				user: users.find(u => u.id === s.userId), 
				...s 
			}
		})
		res.status(200).json(out)
	})
}

async function getSnapshots(em: EntityManager) {
	return await em.find(LeaderboardSnapshot, {})
}

async function clear(em: EntityManager) {
	notice("Clearing leaderboard...")
	let snapshots = await getSnapshots(em)
	if (snapshots)
		await em.removeAndFlush(snapshots)
}

async function getValues(em: EntityManager): Promise<Snapshot[]> {
	notice("Retriving current data...")
	let res = await em.find(GameResult, {})
	// Get all users
	let users = await em.find(User, [...new Set(res.map(r => r.participantId))])
	// Filter and reduce scores into users
	let vals: Snapshot[] = []
	for (let { id, rank } of users) {
		let score = res.filter(r => r.participantId === id && r.score !== 0)
			.map(r => r.score).reduce((a, b) => a + b)
		vals.push({ id, score, rank })
	}
	return vals
}

function processValues(vals: Snapshot[]): Snapshot[] {
	notice("Processing data...")
	// Get top 10 of each category
	let boards: Snapshot[] = []
	for (let i = 1; i <= 5; i++) {
		let rank = vals.filter(v => v.rank == i)
		boards.push(
			...rank.sort((a, b) => a.score + b.score)
				.slice(0, Math.min(rank.length, 10))
		)
	}		
	return boards
}

async function persist(em: EntityManager, out: Snapshot[]) {
	notice("Saving to database...")
	await em.persistAndFlush(out.map(l => new LeaderboardSnapshot(l.id, l.score, l.rank)))
}

function notice(message: string) {
	console.log(chalk.redBright(message))
}