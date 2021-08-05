import { NextPageContext } from "next";
import { User } from "../../api";
import { self, Token } from "../../api/user";
import { homeRedirect } from "../../api/auth";
import Head from "next/head";
import SocketProvider from "../../components/SocketProvider";
import { useSocket } from "../../components/SocketProvider";
import router from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Competitive.module.css"
import Title from "../../components/Title";

interface CompetitiveProps {
    user: User & Token
}

export default function Competitive({ user }: CompetitiveProps) {
    const socket = useSocket(socket => {
        socket.on("join-game", id => {
            socket.close()
            router.push(`/game/${id}`)
        })
    }, {
        position: "pool",
        token: user
    })
    return (
        <div>
            <Title title="Competitive Pool" />
            <button className={styles.back}
                onClick={() => router.push("/")}>Back</button>
            <div className={styles.container}>
                <SocketProvider socket={socket}>
                    <h1>
                        <Ticker text="Attempting to find an opponent" period={750} />
                    </h1>
                    <h1 className={styles.emblem}>🔎</h1>
                </SocketProvider>
            </div>
        </div>
    )
}

interface TickerProps {
    text: string
    max?: number
    period?: number
}

function Ticker({ text, max, period }: TickerProps) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setCount(count + 1), period ?? 500)
        return () => clearInterval(interval)
    }, [count, period])
    return (
        <>{text}{".".repeat(count % (max ?? 3) + 1)}</>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}