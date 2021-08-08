import { User } from "../api"
import { Snapshot } from "../api/leaderboard"
import styles from "../styles/Leaderboard.module.css"
import { getRank } from "../utils"
import Avatar from "./Avatar"
import Link from "next/link"
import { useState } from "react"

interface LeaderboardProps {
    snapshots: Snapshot[]
    rank: number
    color?: string
}

export default function Leaderboard({ snapshots, rank, color }: LeaderboardProps) {
    let users = snapshots.filter(s => s.rank == rank)
    const [open, setOpen] = useState(false)
    return (
        <div className={styles.container} style={{
            background: color
        }}>
            <div className={styles.head}
                onClick={() => users.length && setOpen(!open)}
                style={{
                    cursor: users.length ? "pointer" : undefined
                }}>
                <h1>Rank {getRank(rank)}</h1>
                {users.length ? <h1>{open ? "▼" : "▲"}</h1> : <Empty />}
            </div>
            {open && <ol>
                {users.map(({ user, score }, i) =>
                    <Item key={i} user={user} score={score} />
                )}
            </ol>}
        </div>
    )
}

interface ItemProps {
    user?: User,
    score: number
}

function Item({ user, score }: ItemProps) {
    return (
        <li>
            {user && <Link href={`/profile/${user.id}`}>
                <a className={styles.item}>
                    <Avatar className={styles.avatar} user={user} />
                    <div>{user?.username ?? "Deleted"}</div>
                    <div>{score}</div>
                </a>
            </Link>}
        </li>
    )
}

function Empty() {
    return (
        <h3>No users on this leaderboard yet!</h3>
    )
}