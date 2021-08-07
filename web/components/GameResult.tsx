import { GameRes } from "../api/user"
import styles from "../styles/GameResult.module.css"
import Avatar from "./Avatar"
import Link from "next/link"
import ReactTimeago from "react-timeago"

interface GameResultProps {
    result: GameRes
}

export default function GameResult({
    result: {
        score,
        opponent,
        won,
        time
    }
}: GameResultProps) {
    return (
        <div className={styles.outer}>
            <Link href={`/profile/${opponent?.id}`}>
                <a>
                    <div
                        style={{
                            borderColor: won ? "var(--primary)" : "var(--error)"
                        }}
                        className={styles.container}>
                        {opponent && <Avatar className={styles.avatar} user={opponent} />}
                        <div className={styles.info}>
                            <div>
                                <h2>{opponent?.username ?? "Deleted"}</h2>
                                <ReactTimeago className={styles.time} date={time} />
                            </div>
                            <div>
                                <h3>Score: {score}</h3>
                                <h3><i>{won ? "Won" : "Lost"}</i></h3>
                            </div>
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    )
}