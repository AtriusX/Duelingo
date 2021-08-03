import GameTracker from '../network/GameTracker';
import { User } from '../entities/User';
import { Rivalry } from '../entities/Rivalry';
import { Error } from "."
import { cast } from "../types"
import { EntityManager } from "@mikro-orm/core"
import ConnectionRepository from '../network/ConnectionRepository';

type Join<A, B> = A & B

type NamedRivalry = Join<Rivalry, { id: number, username: string }>

export async function create(
  em: EntityManager,
  sender: number | undefined,
  receiver: number
): Promise<Rivalry | Error> {
    if (sender === receiver)
        return { message: "Cannot create a rivalry with yourself!" }
    if (!sender)
        return { message: "No session provided!" }
    const entity = await rivalry(em, sender, receiver)
    try {
        if (!entity) {
            const data = new Rivalry(sender, receiver)
            await em.persistAndFlush(data)
            return data
        } else if (sender === entity?.receiver && !entity?.active) {
            entity.active = true
            await em.flush()
            return entity
        } else {
            return { message: "Rivalry has already been created!" }
        }
    } catch(e) {
        return { message: "An error occurred." }
    }
}

export async function remove(
  em: EntityManager,
  sender: number | undefined,
  receiver: number
): Promise<null | Error> {
    if (sender === receiver)
        return { message: "Cannot remove a rivalry where the sender and receiver are the same!" }
    if (!sender)
        return { message: "No session provided!" }

    const entity = await rivalry(em, sender, receiver)
    if (!!entity) {
        await em.removeAndFlush(entity)
        return null
    } else {
        return { message: "No rivalry found for given values!" }
    }
}

export async function pending(
    em: EntityManager, 
    sender: number
): Promise<NamedRivalry[] | Error> {
    return getRivals(em, sender, false)
}

export async function active(
    em: EntityManager, 
    sender: number
): Promise<NamedRivalry[] | Error> {
    return getRivals(em, sender, true)
}

export async function allRivals(
    em: EntityManager, 
    sender: number
): Promise<NamedRivalry[] | Error> {
    return getRivals(em, sender)
}

async function getRivals(
    em: EntityManager, 
    sender: number, 
    active?: boolean
): Promise<NamedRivalry[] | Error> {
    if (!sender)
        return { message: "No session provided!" }
    let rivals = await em.find(Rivalry, active !== undefined ? 
        { $or: [{ sender: sender, active }, { receiver: sender, active}] } :
        { $or: [{ sender: sender }, { receiver: sender}] })
    let ids = rivals.map(r => r.sender === sender ? r.receiver : r.sender)
    let users = await em.find(User, ids)
    let out = []
    // We do this so that each rival is properly joined to each user
    for (let i = 0; i < rivals.length; i++) {
        let userId = sender === rivals[i].receiver ? rivals[i].sender : rivals[i].receiver
        let { id, username } = users.find(u => u.id === userId)!
        out.push({ ...rivals[i], id, username })
    }
    return out
}

export async function status(
    em: EntityManager, 
    sender: number, 
    receiver: number
): Promise<Rivalry | null | Error> {
    if (sender === receiver)
        return { message: "Cannot retrieve rivalry status for the same user!" }
    if (!sender)
        return { message: "No session provided!" }
    const entity = await rivalry(em, sender, receiver)
    if (!entity)
        return null
    return entity
}

export async function availableRivals(
    em: EntityManager,
    id: number
): Promise<NamedRivalry[]> {
    let rivals = await active(em, id)
    if (!!cast<Error>(rivals).message)
        return []
    let out: NamedRivalry[] = []
    for (let rival of cast<NamedRivalry[]>(rivals)) {
        let socket = await ConnectionRepository.get().recall(rival.id)
        if (socket?.position === "open" && !GameTracker.get().has(rival.id))
            out.push(rival)
    } 
    return out
}

const rivalry = async (
    em: EntityManager, 
    sender: number, 
    receiver: number
): Promise<Rivalry | null> => await em.findOne(Rivalry, { 
    sender: sender, receiver: receiver
}) || await em.findOne(Rivalry, {
    sender: receiver, receiver: sender
})