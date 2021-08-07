import { User } from "../api";
import { GameRes, Update } from "../api/user";
import { cast } from "../utils";
import RivalButton from "./RivalButton";
import styles from "../styles/UpdateItem.module.css"
import Avatar from "./Avatar";
import ReactTimeago from "react-timeago";
import GameResult from "./GameResult";
import Link from "next/link"

interface UpdateProps {
    user?: User
    update?: Update
}

export default function UpdateItem({ user, update }: UpdateProps) {
    switch (update?.type) {
        case "rivalry":
            return (
                <Link href={`/profile/${user?.id}`}>
                    <a>
                        <div className={styles.container}>
                            <div>
                                <Avatar className={styles.avatar} user={cast<User>(update)} />
                                <p>{!!update && update?.receiver === user?.id
                                    ? `${update.username} requested a rivalry from you `
                                    : `Rivalry requested from ${update.username} `}
                                    <ReactTimeago className={styles.timeago} date={update.createdAt} />
                                </p>
                            </div>
                            <RivalButton self={user} user={cast<User>(update)} state={update} />
                        </div>
                    </a>
                </Link>
            )
        case "result":
            return (
                <GameResult result={cast<GameRes>(update)} />
            )
    }

    return null
}