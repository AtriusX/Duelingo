import { tryLogout } from '../api/auth';
import { User } from '../api/user';
import Link from "next/link"
import Navbar from './Navbar';
import styles from '../styles/Home.module.css'
import Avatar from './Avatar';

interface HomeProps {
    user: User
}

export default function Home({ user }: HomeProps) {
    return (
        <>
            <Navbar redirect="/search" user={user}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div className={styles.body}>
                <div className={styles.user}>
                    <h1>Welcome back {user?.username}!</h1>
                    <Avatar user={user} className={styles.avatar} />
                    <hr />
                    <div>
                        <p>Stats go here later</p>
                    </div>
                </div>
                <div className={styles.updates}>
                    <h2>No recent updates</h2>
                </div>
                <div className={styles.game}>
                    <div className={styles.play}>
                        <h1>Ready to play?</h1>
                        <button>Join Game</button>
                    </div>
                </div>
            </div>
        </>
    )
}