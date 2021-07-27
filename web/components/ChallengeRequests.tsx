import router from "next/router"
import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { User } from "../api"
import { acceptGame, getChallengers, rejectGame } from "../api/game"
import styles from "../styles/ChallengeRequests.module.css"
import SocketProvider from "./SocketProvider"

type Challenge = {
    id: number,
    username: string,
    time: number
}

interface ChallengeRequestsProps {
    user?: User,
    socket?: Socket
}

export default function ChallengeRequests({ user, socket }: ChallengeRequestsProps) {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    useEffect(() => {
        getChallengers(user?.id ?? 0).then(setChallenges)
    }, [user?.id])
    const load = (socket: Socket) => {
        socket.on("get-challenges", setChallenges)
    }
    return (
        <SocketProvider socket={socket} load={load}>
            <div className={styles.container}>
                {challenges?.map((r, i) => <RequestItem key={i} {...r} state={challenges} setState={setChallenges} />)}
            </div>
        </SocketProvider>
    )
}

function RequestItem({ id, username, time, state, setState }: Challenge & { state: Challenge[], setState: (c: Challenge[]) => void }) {
    return <div className={styles.item}>
        <p>{username} requested a game.</p>
        <div>
            <button
                onClick={async () => {
                    let gameId = (await acceptGame(id)).id
                    if (!gameId) return
                    router.push(`/game/${gameId}`)
                }}>
                Accept
            </button>
            <button
                onClick={e => {
                    rejectGame(id)
                    setState(state.filter(c => c.id !== id))
                }}>
                x
            </button>
        </div>
    </div>
}