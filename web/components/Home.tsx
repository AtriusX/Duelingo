import { tryLogout } from '../api/auth';
import { User } from '../api/';
import Link from "next/link"
import Navbar from './Navbar';
import styles from '../styles/Home.module.css'
import Avatar from './Avatar';
import Pane from './Pane';
import SocketProvider from "../components/SocketProvider"
import { getUpdates, Stats, Token, Update } from '../api/user';
import UpdateItem from './UpdateItem';
import { useSocket } from '../components/SocketProvider';
import ChallengeRequests from "../components/ChallengeRequests"
import router from 'next/router';
import StatBar from './StatBar';
import { getRank, useCounter } from '../utils';
import Loader from './Loader';
import { useState } from 'react';

interface HomeProps {
    user: User & Token
    stats?: Stats
}

export default function Home({ user, stats }: HomeProps) {
    // This might need to change later on
    const { winRatio, points, nextRank, rankedPlays } = stats ?? {}
    const socket = useSocket(socket => {
        socket.emit("join-game", (id: string) => {
            socket.close()
            router.push(`/game/${id}`)
        })
    }, { token: user })
    const [items, setItems] = useState<Update[]>()
    const [page, inc] = useCounter()
    return (
        <>
            <ChallengeRequests user={user} socket={socket} />
            <SocketProvider socket={socket} token={user?.token}>
                <div className={styles.body}>
                    <Navbar redirect="/search" user={user}>
                        <Link href={`/profile/${user?.id}`}>My Profile</Link>
                        <Link href={"/settings"}>Settings</Link>
                        <a onClick={() => tryLogout(socket)}>Logout</a>
                    </Navbar>
                    <div className={styles.content}>
                        <div className={styles.user}>
                            <h3>{user.username}</h3>
                            <hr />
                            <Avatar user={user} className={styles.avatar} />
                            <hr />
                            <div className={styles.stats}>
                                <StatBar value={getRank(user.rank)} text="Rank" display="raw" />
                                <StatBar value={winRatio} text="Win Ratio" />
                                <StatBar value={points} text="Points" display="raw" color="none" />
                                <StatBar value={nextRank} text="Next Rank" display="ratio" color="#3bb0df" />
                                <StatBar value={rankedPlays} text="Ranked Plays" display="raw" color="none" />
                            </div>
                        </div>
                        <Pane className={styles.updates}
                            emptyIcon="📃" emptyText="No recent updates!" items={!!items ? items : [undefined]}>
                            <h2>Updates</h2>
                            {items?.map((u, i) => <UpdateItem key={i} user={user} update={u} />)}
                            <Loader action={async (v, hide) => {
                                if (!v) return
                                let updates = await getUpdates(page)
                                if (!updates.length) return hide()
                                setItems([...items ?? [], ...updates])
                                inc()
                                if (updates.length < 50)
                                    hide()
                            }} />
                        </Pane>
                        <div className={styles.game}>
                            <h1>Ready to play?</h1>
                            <div className={styles.play}>
                                <h2>Select a game mode!</h2>
                                <div className={styles.buttons}>
                                    <Link href="/game/casual">Casual</Link>
                                    <Link href="/game/competitive">Competitive</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SocketProvider>
        </>
    )
}
