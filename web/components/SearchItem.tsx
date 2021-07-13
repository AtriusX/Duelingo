import styles from '../styles/SearchItem.module.css'
import Link from 'next/link'
import { User } from '../api/user'
import Avatar from './Avatar'

interface SearchItemData {
    user: User
}

export default function SearchItem({ user }: SearchItemData) {
    const { id, username, joined } = user
    return (
        <Link href={`/profile/${id}`}>
            <a draggable={false} className={styles.searchitem}>
                <Avatar className={styles.avatar} user={user} />
                <div className={styles.info}>
                    <h3>{username}</h3>
                    <p>Joined on {new Date(joined).toLocaleDateString()}</p>
                </div>
            </a>
        </Link>
    )
}