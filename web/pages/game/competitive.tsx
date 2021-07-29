import { NextPageContext } from "next";
import { User } from "../../api";
import { self, Token } from "../../api/user";
import { homeRedirect } from "../../api/auth";
import Head from "next/head";
import SocketProvider from "../../components/SocketProvider";
import { defaultSocket } from "../../utils";
import router from "next/router";
import { useEffect } from "react";

interface CompetitiveProps {
    user: User & Token
}

export default function Competitive({ user }: CompetitiveProps) {
    useEffect(() => {
        defaultSocket(socket => {
            socket.on("join-game", id => {
                socket.close()
                router.push(`/game/${id}`)
            })
        }, "pool", user.token)
    })
    return (
        <div>
            <Head>
                <title>Competitive Matchmaking</title>
            </Head>
            <SocketProvider>
                <h1>Attempting to find an opponent</h1>
            </SocketProvider>
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}