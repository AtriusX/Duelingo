import { HTMLProps, useEffect } from "react";
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

export default function SocketProvider({ socket, token, load, ...props }: SocketProps) {
    const client = !!socket ? socket : io("http://localhost:3000")
    // Relies on useEffect to prevent clients from duplicating on the client-side
    useEffect(() => {
        if (!!load) load(client, token)
    })
    return (
        <div {...props} />
    )
}
