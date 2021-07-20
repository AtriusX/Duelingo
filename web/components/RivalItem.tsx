import { NamedRivalry, User } from "../api";
import Link from "next/link"
import styles from "../styles/RivalItem.module.css"
import RivalButton from "./RivalButton";
import { cast } from "../utils";
import Avatar from "./Avatar";

interface RivalItemProps {
    me?: User
    self: User
    rivalry: NamedRivalry
}

export default function RivalItem({ me, self, rivalry }: RivalItemProps) {
    const rival = self.id === rivalry.sender ? rivalry.receiver : rivalry.sender
    return (
        <Link href={`/profile/${rival}`} passHref>
            <div className={styles.box}>
                <Avatar className={styles.avatar} user={rivalry} />
                <a className={styles.link}>{rivalry.username}</a>
                <div>
                    <RivalButton self={me} user={cast<User>(rivalry)} state={rivalry} />
                </div>
            </div>
        </Link>
    )
}