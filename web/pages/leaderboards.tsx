import { NextPageContext } from "next";
import Link from "next/link";
import { User } from "../api";
import { tryLogout } from "../api/auth";
import { self, Token } from "../api/user";
import Leaderboard from "../components/Leaderboard";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import styles from "../styles/Leaderboards.module.css"

interface LeaderboardProps {
    user: User & Token
}

export default function Leaderboards({ user }: LeaderboardProps) {
    return (
        <div>
            <Title title="Leaderboards" />
            <Navbar redirect="/search" user={user}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={() => tryLogout()}>Logout</a>
            </Navbar>
            <div className={styles.container}>
                <Leaderboard />
                <Leaderboard />
                <Leaderboard />
            </div>
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    return {
        props: { user }
    }
}
