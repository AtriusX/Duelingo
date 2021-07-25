import { HTMLProps, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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

export const createSocket = () => io("http://localhost:3000")

export default function SocketProvider({ socket, token, load, ...props }: SocketProps) {
    let client = !!socket ? socket : createSocket()
    // Relies on useEffect to prevent clients from duplicating on the client-side
    const [ran, setRan] = useState(false)
    useEffect(() => {
        if (!ran && !!load) {
            console.log("Init");
            load(client, token)
            setRan(true)
        }
    }, [client, token, load, ran])
    return (
        <div {...props} />
    )
}