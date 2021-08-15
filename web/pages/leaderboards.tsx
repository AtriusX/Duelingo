import { NextPageContext } from "next";
import Link from "next/link";
import { User } from "../api";
import { homeRedirect, tryLogout } from "../api/auth";
import { getLeaderboards, Snapshot } from "../api/leaderboard";
import { self, Token } from "../api/user";
import Leaderboard from "../components/Leaderboard";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import styles from "../styles/Leaderboards.module.css"

interface LeaderboardProps {
    user: User & Token,
    leaderboards: Snapshot[]
}

const colors = [
    "var(--primary)",
    "#df9b36",
    "var(--urgent)",
    "#0066FF",
    "#6600FF"
]

export default function Leaderboards({ user, leaderboards }: LeaderboardProps) {
    return (
        <div>
            <Title title="Leaderboards" />
            <div className={styles.outer}>
                <Navbar redirect="/search" user={user}>
                    <Link href={`/profile/${user?.id}`}>My Profile</Link>
                    <Link href={"/settings"}>Settings</Link>
                    <a onClick={() => tryLogout()}>Logout</a>
                </Navbar>
                <div className={styles.container}>
                    <div>
                        {range(1, 5).reverse().map(n =>
                            <Leaderboard key={n} snapshots={leaderboards}
                                rank={n} color={colors[(n - 1) % colors.length]} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function range(start: number, end: number) {
    let out = []
    for (let i = start; i <= end; i++)
        out.push(i)
    return out
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    const leaderboards = await getLeaderboards()
    return {
        props: { user, leaderboards }
    }
}
