import { tryLogout } from '../api/auth';
import { User } from '../api/';
import Link from "next/link"
import Navbar from './Navbar';
import styles from '../styles/Home.module.css'
import Avatar from './Avatar';
import Pane from './Pane';

interface HomeProps {
    user: User
}

export default function Home({ user }: HomeProps) {
    return (
        <>
            <div className={styles.body}>
                <Navbar redirect="/search" user={user}>
                    <Link href={`/profile/${user?.id}`}>My Profile</Link>
                    <Link href={"/settings"}>Settings</Link>
                    <a onClick={tryLogout}>Logout</a>
                </Navbar>
                <div className={styles.content}>
                    <div className={styles.user}>
                        <Avatar user={user} className={styles.avatar} />
                        <hr />
                        <div>
                            <p>Stats go here later</p>
                        </div>
                    </div>
                    <Pane className={styles.updates} emptyIcon="📃" emptyText="No recent updates!">
                        {/* TODO: Updates should be put here later */}
                    </Pane>
                    <div className={styles.game}>
                        <div className={styles.play}>
                            <h1>Ready to play?</h1>
                            <div className={styles.buttons}>
                                <Link href="/game/casual">Casual</Link>
                                <Link href="/game/competitive">Competitive</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}