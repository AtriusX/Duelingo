import { tryLogout } from '../api/auth';
import { User } from '../api/';
import Link from "next/link"
import Navbar from './Navbar';
import styles from '../styles/Home.module.css'
import Avatar from './Avatar';
import Pane from './Pane';
import SocketProvider from "../components/SocketProvider"
import { io, Socket } from 'socket.io-client';
import { Token, Update } from '../api/user';
import UpdateItem from './UpdateItem';

interface HomeProps {
    user: User & Token
    updates?: Update[]
}

export default function Home({ user, updates }: HomeProps) {
    // This might need to change later on
    const socket = io("http://localhost:3000")
    return (
        <SocketProvider socket={socket} load={loadSocket} token={user?.token}>
            <div className={styles.body}>
                <Navbar redirect="/search" user={user}>
                    <Link href={`/profile/${user?.id}`}>My Profile</Link>
                    <Link href={"/settings"}>Settings</Link>
                    <a onClick={() => tryLogout(socket)}>Logout</a>
                </Navbar>
                <div className={styles.content}>
                    <div className={styles.user}>
                        <Avatar user={user} className={styles.avatar} />
                        <hr />
                        <div>
                            <p>Stats go here later</p>
                        </div>
                    </div>
                    <Pane className={styles.updates}
                        emptyIcon="📃" emptyText="No recent updates!" items={updates}>
                        <h2>Updates</h2>
                        {updates?.map((u, i) => <UpdateItem key={i} user={user} update={u} />)}
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
    )
}

function loadSocket(socket: Socket, token?: string) {
    if (!token) return
    // Token handshake must be done via connect by itself to keep events from duplicating
    socket.on("connect", () => socket.emit("handshake", token))
    // Test server broadcast
    socket.on("test", id => console.log(id))
}
