import { User } from "../api";
import { Update } from "../api/user";
import { cast } from "../utils";
import RivalButton from "./RivalButton";
import styles from "../styles/UpdateItem.module.css"
import Avatar from "./Avatar";
import ReactTimeago from "react-timeago";
import { acceptGame, rejectGame } from "../api/game";
import router from "next/router";

interface UpdateProps {
    user?: User
    update?: Update
}

export default function UpdateItem({ user, update }: UpdateProps) {
    switch (update?.type) {
        case "rivalry":
            return (
                <div className={styles.container}>
                    <div>
                        <Avatar className={styles.avatar} user={cast<User>(update)} />
                        <p>{!!update && update?.receiver === user?.id
                            ? `${update.username} requested a rivalry from you `
                            : `Requested a rivalry from ${update.username} `}
                            <ReactTimeago date={update.createdAt} />
                        </p>
                    </div>
                    <RivalButton self={user} user={cast<User>(update)} state={update} />
                </div>
            )
        case "challenge":
            return (
                <div className={styles.container}>
                    <div>
                        <Avatar className={styles.avatar} user={cast<User>(update)} />
                        <p>{`${update.username} challenged you to a casual match`}</p>
                    </div>
                    <div>
                        <button
                            onClick={async () => {
                                let id = (await acceptGame(update.id)).id
                                if (!id) return
                                router.push(`/game/${id}`)
                            }}>
                            Accept
                        </button>
                        <button
                            onClick={() => rejectGame(update.id)}>
                            Reject
                        </button>
                    </div>
                </div>
            )
    }

    return null
}