import Searchbar, { SearchbarProps } from "./Searchbar";
import styles from '../styles/Navbar.module.css'
import Avatar from "./Avatar";
import { HTMLProps, ReactElement } from "react";
import { User } from "../api/";
import Link from "next/link";

interface NavbarProps extends SearchbarProps {
    user?: User
    children?: ReactElement<HTMLProps<any>>[]
}

export default function Navbar({ user, children, ...others }: NavbarProps) {
    return (
        <div className={styles.container}>
            <div className={styles.navbar}>
                <Link href="/">
                    <a>Home</a>
                </Link>
                <div className={styles.box}>
                    <Searchbar {...others} className={styles.search} />
                </div>
                {user
                    ? <div className={styles.open} onClick={openOptions}>
                        <Avatar user={user} className={styles.avatar} />
                        <p>{user?.username}</p>
                    </div>
                    : <Link href="/signin">Login</Link>}
            </div>
            {user ?
                <ul id={styles.options}>
                    {children?.map((c, i) => <li key={i} onClick={openOptions}>{c}</li>)}
                </ul>
                : null}
        </div>
    )
}

function openOptions() {
    let options = document.getElementById(styles.options)
    if (!options) return
    if (options?.style.display === "block")
        options.style.display = "none"
    else
        options.style.display = "block"
}