import { User } from "../api";
import { Update } from "../api/user";
import { cast } from "../utils";
import RivalButton from "./RivalButton";
import styles from "../styles/UpdateItem.module.css"
import Avatar from "./Avatar";

interface UpdateProps {
    user?: User
    update?: Update
}

export default function UpdateItem({ user, update }: UpdateProps) {
    if (update?.type === "rivalry")
        return (
            <div className={styles.container}>
                <div>
                    <Avatar className={styles.avatar} user={cast<User>(update)} />
                    <p>Requested a rivalry from {update.username} on {new Date(update.createdAt).toLocaleDateString()}</p>
                </div>
                <RivalButton self={user} user={cast<User>(update)} state={update} />
            </div>
        )
    return null
}