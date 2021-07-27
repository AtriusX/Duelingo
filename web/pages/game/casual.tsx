import { NextPageContext } from "next";
import { NamedRivalry, Option, User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self, Token } from "../../api/user"
import Title from "../../components/Title";
import FindRival from "../../components/FindRival"
import styles from "../../styles/Casual.module.css"
import router from "next/router";
import { createSocket } from "../../components/SocketProvider";
import { Socket } from "socket.io-client";
import { useState } from "react";

interface CasualProps {
    user: User & Token
}

export default function Casual({ user }: CasualProps) {
    const socket = createSocket()
    const [challenge, setChallenge] = useState<Option<NamedRivalry>>(null)
    const load = (socket: Socket, token?: string) => {
        socket.on("connect", () => socket.emit("handshake", token))
        socket.on("ping", () => socket.emit("handshake", token))
        socket.on("challenge-accepted", v => router.push(`/game/${v}`))
        socket.on("challenge-rejected", v => setChallenge(null))
        socket.on("get-challenges", v => alert(v))
    }
    return (
        <div>
            <button className={styles.back}
                onClick={() => router.push("/")}>Back</button>
            {!challenge ? <Selector socket={socket} load={load} user={user} select={setChallenge} /> : <Wait challenge={challenge} />}
        </div>
    )
}

interface SelectorProps {
    socket: Socket
    load: (socket: Socket, token?: string) => void
    user: User & Token
    select: (user: NamedRivalry) => void
}

function Selector({ socket, load, user, select }: SelectorProps) {
    return (
        <div className={styles.box}>
            <Title title={"Casual Matchmaking"} />
            <FindRival socket={socket} load={load} className={styles.selector} user={user} select={select} />
        </div>
    )
}

interface WaitProps {
    challenge: NamedRivalry
}

function Wait({ challenge }: WaitProps) {
    return (
        <div className={styles.box}>
            <h1>Issued challenge to {challenge.username}</h1>
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}