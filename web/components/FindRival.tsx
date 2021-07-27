/* eslint-disable react-hooks/exhaustive-deps */
import { HTMLProps, useEffect, useState } from "react";
import Pane from "./Pane";
import SocketProvider from "./SocketProvider";
import { Socket } from "socket.io-client";
import { NamedRivalry, Option, User } from "../api";
import { Token } from "../api/user";
import CasualSelection from "./CasualSelection";
import styles from "../styles/FindRival.module.css"

interface FindRivalProps extends HTMLProps<HTMLDivElement> {
    user: User & Token,
    socket: Socket,
    load: (socket: Socket, token?: string) => void
    select: (user: NamedRivalry) => void
}

export default function FindRival({ user, socket, load, select, ...props }: FindRivalProps) {
    const [rivals, setRivals] = useState<Option<NamedRivalry[] | undefined>>(undefined)

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
    }, [query])
    return (
        <SocketProvider {...props} socket={socket} token={user.token} load={load}>
            <input type="text" name="search" id="search" placeholder="Rival"
                onChange={e => setQuery(e.target.value)} autoComplete="off" />
            <Pane className={styles.pane}
                emptyText={rivals ? "No results found!" : "Search for a rival!"}
                emptyIcon={rivals ? "🪐" : "🌎"} items={rivals ?? 0}>
                {rivals?.map((r, i) =>
                    <CasualSelection token={user as Token} socket={socket} key={i} rival={r} select={select} />
                )}
            </Pane>
        </SocketProvider>
    )
}