import { Socket, Server } from "socket.io"

type Repo = {
    [id: number]: string
}

export class ConnectionRepository {
    private io: Server
    private static inst?: ConnectionRepository

    private readonly repo: Repo = {}

    private constructor(io: Server) {
        this.io = io
    }

    public static init(io: Server): ConnectionRepository {
        this.inst = new ConnectionRepository(io)
        return this.get()
    }

    public static get(): ConnectionRepository {
        if (!this.inst)
            throw new Error("Repository has not been initialized!")
        return this.inst
    }

    public insert(id: number, socket: Socket) {
        this.repo[id] = socket.id
    }

    public recall(id: number): Socket | undefined {
        return this.io.sockets.sockets.get(this.repo[id])
    }

    public relay(id: number, func: (socket?: Socket) => void) {
        func(this.recall(id))
    }

    public forEach(func: (socket?: Socket) => void) {
        Object.values(this.repo)
            .forEach((id) => func(this.io.sockets.sockets.get(id)))
    }
}