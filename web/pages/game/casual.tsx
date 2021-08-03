import { NextPageContext } from "next";
import { NamedRivalry, Option, User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self, Token } from "../../api/user"
import Title from "../../components/Title";
import FindRival from "../../components/FindRival"
import styles from "../../styles/Casual.module.css"
import router from "next/router";
import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { cancelChallenge } from "../../api/game";
import { defaultSocket } from "../../utils";
import Countdown from "../../components/Countdown";

interface CasualProps {
    user: User & Token
    currentChallenge?: [NamedRivalry, number]
}

export default function Casual({ user, currentChallenge }: CasualProps) {
    const [challenge, setChallenge] =
        useState<Option<NamedRivalry>>(currentChallenge ? currentChallenge[0] : null)
    let socket = defaultSocket((socket) => {
        socket.on("join-game", v => router.push(`/game/${v}`))
        socket.on("challenge-rejected", () => setChallenge(null))
    }, "queue", user.token)
    useEffect(() => {
        router.events.on("routeChangeComplete", () => cancelChallenge(challenge?.id ?? 0))
    })
    return (
        <div>
            <Title title="Casual Queue" />
            <button className={styles.back}
                onClick={() => router.push("/")}>Back</button>
            {!challenge
                ? <Selector socket={socket} user={user} select={setChallenge} />
                : <Wait challenge={challenge}
                    time={currentChallenge ? currentChallenge[1] : undefined}
                    setChallenge={setChallenge} />}
        </div>
    )
}

interface SelectorProps {
    socket: Socket
    load?: (socket: Socket, token?: string) => void
    user: User & Token
    select: (user: NamedRivalry) => void
}

function Selector({ socket, load, user, select }: SelectorProps) {
    return (
        <div className={styles.box}>
            <FindRival socket={socket} load={load}
                className={styles.selector} user={user} select={select} />
        </div>
    )
}

interface WaitProps {
    challenge: NamedRivalry
    time?: number
    setChallenge: (user: Option<NamedRivalry>) => void
}

function Wait({ challenge, setChallenge }: WaitProps) {
    return (
        <div className={styles.box}>
            <Countdown className={styles.counter} duration={120} end={() => {
                setChallenge(null)
                cancelChallenge(challenge.id)
            }} />
            <div className={styles.waitcontainer}>
                <h1>Issued a challenge to {challenge.username}</h1>
                <p>A request has been sent to {challenge.username}! Please be patient while we wait for a response.</p>
                <button className={styles.cancel} onClick={() => {
                    setChallenge(null)
                    cancelChallenge(challenge.id)
                }}>Cancel Challenge</button>
            </div>
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}