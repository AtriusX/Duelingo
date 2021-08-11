import styles from '../styles/SearchItem.module.css'
import Link from 'next/link'
import { User } from '../api/'
import Avatar from './Avatar'
import { getRank } from '../utils'

interface SearchItemData {
    user: User
}

export default function SearchItem({ user }: SearchItemData) {
    const { id, username, joined, rank } = user
    return (
        <Link href={`/profile/${id}`}>
            <a draggable={false} className={styles.searchitem}>
                <Avatar className={styles.avatar} user={user} />
                <div className={styles.info}>
                    <h3><b>({getRank(rank)})</b> {username}</h3>
                    <p>Joined on {new Date(joined).toLocaleDateString()}</p>
                </div>
            </a>
        </Link>
    )
}