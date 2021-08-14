import GameTracker from "../network/GameTracker"
import { Option } from "./../types"
import { Socket, Server } from "socket.io"
import RedisMemory from "./RedisMemory"
import ChallengeManager from "./ChallengeManager"
import MatchMaker from "./Matchmaker"

type Position = "open" | "queue" | "pool" | "game"

type Status<T = string> = {
  socket: T
  position?: Position
  lastPinged: number
  timestamp: number
}
export default class ConnectionRepository {
  private io: Server
  private static inst?: ConnectionRepository
  private readonly repo: RedisMemory<Status> = RedisMemory.create(
    "socket",
    JSON.stringify,
    JSON.parse,
    360
  )
  private active: Set<number> = new Set()
  private interval: NodeJS.Timer

  private constructor(io: Server, seconds: number) {
    this.io = io
    let sec = seconds * 1000
    this.interval = setInterval(() => {
      this.active.forEach(async (id) =>
        this.recall(id).then(async (v) => {
          
          if (!!v && v.lastPinged + sec * 2 < Date.now()) return this.drop(id)
          else v?.socket?.emit("ping")
        })
      )
    }, sec)
  }

  public static init(
    io: Server,
    pingSeconds: number = 3
  ): ConnectionRepository {
    this.inst = new ConnectionRepository(io, pingSeconds)
    return this.get()
  }

  public static get(): ConnectionRepository {
    if (!this.inst) throw new Error("Repository has not been initialized!")
    return this.inst
  }

  public insert(
    id: number,
    socket: Socket,
    position: Position,
    timestamp: number
  ) {    
    if (!id) return
    this.repo.recall(id).then((v) => {
      if (v?.timestamp! > timestamp) {
        socket.emit("end")
        return
      }
      this.active.add(id)
      this.repo.store(id, {
        socket: socket.id,
        position,
        lastPinged: Date.now(),
        timestamp,
      })
    })
  }

  public async has(id: number): Promise<boolean> {
    let val = await this.repo.recall(id)
    return !!val
  }

  public async recall(id: number): Promise<Status<Option<Socket>> | undefined> {
    let data = await this.repo.recall(id)
    if (!data) return undefined
    return {
      socket: this.io.sockets.sockets.get(data.socket),
      position: data.position,
      lastPinged: data.lastPinged,
      timestamp: data.timestamp,
    }
  }

  public drop(id: number) {
    this.active.delete(id)
    this.repo.forget(id)
    MatchMaker.get().remove(id)
    ChallengeManager.get().clear(id)
    GameTracker.get().drop(id)
    let manager = ChallengeManager.get()
    let chal = manager.getChallenge(id)
    if (chal) manager.cancel(id, chal)
  }

  public async relay(id: number, func: (socket: Socket, id?: number) => void) {
    let res = await this.recall(id)

    if (res?.socket) func(res.socket, id)
  }

  public forEach(func: (socket?: Socket, id?: number) => void) {
    this.active.forEach((id) => this.relay(id, func))
  }

  public destroy() {
    clearInterval(this.interval)
  }
}
