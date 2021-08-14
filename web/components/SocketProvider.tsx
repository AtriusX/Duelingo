import router from "next/router";
import { HTMLProps, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Token } from "../api/user";
import { cast } from "../utils";

/**
 * The token in this interface allows us to specify an existing user session to 
 * modify send events under. If the token is not provided, connections may still
 * work but will only be able to send events in a public fashion.
 */
interface SocketProps extends HTMLProps<HTMLDivElement> {
    socket?: Socket
    token?: string
    load?: (socket: Socket, token?: string) => void
}

export const createSocket = () => io(process.env.NEXT_PUBLIC_API!)

type SocketLoad = (socket: Socket, token?: string) => void

type Position = "open" | "queue" | "pool" | "game"

type SocketOptions = {
    position?: Position;
    token?: string | Token
}

export const useSocket = (
    load: SocketLoad,
    { position, token }: SocketOptions
) => useState(() => {
    let socket = createSocket()
    let timestamp = Date.now()
    let pos = position ?? "open"
    let userToken = (cast<Token>(token).token ?? token) as string | undefined
    socket.on("connect", () =>
        socket.emit("handshake", userToken, pos, timestamp)
    )
    socket.on("ping", () =>
        socket.emit("handshake", userToken, pos, timestamp)
    )
    socket.on("end", () =>
        socket.close()
    )
    load(socket, userToken)
    return socket
})[0]


export default function SocketProvider({ socket, token, load, ...props }: SocketProps) {
    let client = !!socket ? socket : createSocket()
    // Relies on useEffect to prevent clients from duplicating on the client-side
    const [ran, setRan] = useState(false)
    useEffect(() => {
        if (!ran && !!load) {
            load(client, token)
            setRan(true)
        }
    }, [client, token, load, ran])
    return (
        <div {...props} />
    )
}