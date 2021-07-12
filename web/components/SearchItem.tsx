import styles from '../styles/SearchItem.module.css'
import Link from 'next/link'

interface SearchItemData {
    id: number
    displayName: string
    joined: string
}

export default function SearchItem({ id, displayName, joined }: SearchItemData) {
    return (
        <Link href={`/profile/${id}`}>
            <a draggable={false} className={styles.searchitem}>
                <h3>{displayName}</h3>
                <p>Joined on {new Date(joined).toLocaleDateString()}</p>
            </a>
        </Link>
    )
}