import styles from '../styles/Avatar.module.css'
import Image from 'next/image'

type AvatarProps = {
    user: { avatar?: string, displayName: string },
    className?: string
}

export default function Avatar({ user: { avatar, displayName }, className }: AvatarProps) {
    return (
        <div className={`${className ?? ""} ${styles.container} `}>
            <div className={styles.avatar} style={{ background: colorHash(displayName) }}>
                {avatar ? <Image
                className={styles.avatar}
                width="100%"
                height="100%"
                src={avatar}
                alt={displayName}
                /> : undefined}
            </div>
        </div>
    )
}

function colorHash(seed: string) {
    const num = parseInt(seed.replace(/[^\w\d]/g, ""), 36) % 0xFFFFFF
    return `#${num.toString(16).padStart(6, "0")}`
}