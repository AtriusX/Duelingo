import styles from '../styles/Avatar.module.css'
import Image from 'next/image'
import { User } from '../api/'

type AvatarProps = {
    user?: User
    className?: string
}

export default function Avatar({ user, className }: AvatarProps) {
    return (
        <div className={`${className ?? ""} ${styles.container}`}>
            <div className={styles.avatar} style={{ background: colorHash(user?.username ?? "") }}>
                {user && user.avatar ? <Image
                    className={styles.avatar}
                    width="100%"
                    height="100%"
                    src={user.avatar}
                    alt=""
                /> : undefined}
            </div>
        </div>
    )
}

export function colorHash(seed: string) {
    const num = parseInt(seed.replace(/[^\w\d]/g, ""), 36) % 0xFFFFFF
    return `#${num.toString(16).padStart(6, "0")}`
}