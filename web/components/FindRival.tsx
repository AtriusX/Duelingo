import { HTMLProps, useEffect, useState } from "react";
import Pane from "./Pane";
import SocketProvider, { createSocket } from "./SocketProvider";
import { Socket } from "socket.io-client";
import { NamedRivalry, Option, User } from "../api";
import { Token } from "../api/user";
import CasualSelection from "./CasualSelection";
import styles from "../styles/FindRival.module.css"

interface FindRivalProps extends HTMLProps<HTMLDivElement> {
    user: User & Token
}

export default function FindRival({ user, ...props }: FindRivalProps) {
    const socket = createSocket()
    const [rivals, setRivals] = useState<Option<NamedRivalry[] | undefined>>(undefined)
    const load = (socket: Socket, token?: string) => {
        socket.on("connect", () => socket.emit("handshake", token))
        socket.on("ping", () => socket.emit("handshake", token))
    }
    const [query, setQuery] = useState("")
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!!query.length) {
                socket.emit("query-rivals", user.token, query)
                socket.on("get-rivals", setRivals)
            } else {
                setRivals(undefined)
            }
        }, 500)
        return () => clearTimeout(timer)

    },
        // This only includes the query because we want this to only update after the query is last updated
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [query]
    )
    return (
        <SocketProvider {...props} socket={socket} token={user.token} load={load}>
            <input type="text" name="search" id="search" placeholder="Rival" onChange={e => setQuery(e.target.value)} autoComplete="off" />
            <Pane className={styles.pane} emptyText={rivals !== undefined ? "No results found!" : "Search for a rival!"} emptyIcon={rivals ? "🪐" : "🌎"} items={rivals ?? 0}>
                {rivals?.map((r, i) => <CasualSelection key={i} rival={r} />)}
            </Pane>
        </SocketProvider>
    )
}