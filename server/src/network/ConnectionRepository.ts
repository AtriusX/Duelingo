import { Option } from './../types';
import { Socket, Server } from "socket.io"
import RedisMemory from "./RedisMemory"

type Availability = "available" | "busy"

type Status<T = string> = {
    socket: T
    status: Availability,
    lastPinged: number
} 
export default class ConnectionRepository {
    private io: Server
    private static inst?: ConnectionRepository
    private readonly repo: RedisMemory<Status> = 
        RedisMemory.create("socket", JSON.stringify, JSON.parse)
    private active: Set<number> = new Set()
    private interval: NodeJS.Timer

    private constructor(io: Server, seconds: number) {
        this.io = io
        let sec = seconds * 1000
        this.interval = setInterval(() => {
            this.active.forEach(async id => this.recall(id).then(async v => {
                if (!!v && v.lastPinged + sec * 2 < Date.now())
                    return this.drop(id)
                else
                    v?.socket?.emit("ping")
            }))
        }, sec)
    }

    public static init(io: Server, pingSeconds: number = 3): ConnectionRepository {
        this.inst = new ConnectionRepository(io, pingSeconds)
        return this.get()
    }

    public static get(): ConnectionRepository {
        if (!this.inst)
            throw new Error("Repository has not been initialized!")
        return this.inst
    }

    public insert(id: number, socket: Socket, status: Availability) {
        if (!id) return
        this.active.add(id)
        this.repo.store(id, { socket: socket.id, status, lastPinged: Date.now() })
    }

    public async has(id: number): Promise<boolean> {
        return await this.repo.recall(id) !== undefined
    }

    public async recall(id: number): Promise<Status<Option<Socket>> | undefined> {
        let data = await this.repo.recall(id)
        if (!data) return undefined
        return {
            socket: this.io.sockets.sockets.get(data.socket),
            status: data.status,
            lastPinged: data.lastPinged
        }
    }

    public drop(id: number) {
        this.active.delete(id)
        this.repo.forget(id)
    }

    public async relay(id: number, func: (socket?: Socket, id?: number) => void) {
        func((await this.recall(id))?.socket, id)
    }

    public forEach(func: (socket?: Socket, id?: number) => void) {
        this.active.forEach(id => this.relay(id, func))
    }

    public destroy() {
        clearInterval(this.interval)
    }
}