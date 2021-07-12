import Searchbar, { SearchbarProps } from "./Searchbar";
import styles from '../styles/Navbar.module.css'
import Avatar from "./Avatar";
import { HTMLProps, ReactElement } from "react";

interface NavbarProps extends SearchbarProps {
    user?: { avatar?: string, displayName: string }
    children?: ReactElement<HTMLProps<any>>[]
}

export default function Navbar({ user, children, ...others }: NavbarProps) {
    return (
        <div className={styles.container}>
            <div className={styles.navbar}>
                <Searchbar {...others} className={styles.search} />
                {user ? <div className={styles.open} onClick={openOptions}>
                    <Avatar user={user} className={styles.avatar} />
                    <p>{user.displayName}</p>
                </div> : undefined}
            </div>
            {user ?
                <ul id={styles.options}>
                    {children?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                : undefined}
        </div>
    )
}

function openOptions(e: any) {
    let options = document.getElementById(styles.options)
    if (!options) return
    if (options?.style.display === "block")
        options.style.display = "none"
    else
        options.style.display = "block"
}