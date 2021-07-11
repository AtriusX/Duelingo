import { HTMLProps } from "react";
import styles from '../styles/Searchbar.module.css'

interface SearchbarProps extends HTMLProps<HTMLFormElement> {
    name?: string
    redirect?: string
    value?: string | string[]
}

export default function Searchbar({ name, redirect, value, className, ...others }: SearchbarProps) {

    return (
        <div className={`${className} ${styles.searchbar}`}>
            <form autoComplete="off" {...others} action={redirect}>
                <input type="text" placeholder="Search" {...{ name, id: name, defaultValue: value }} />
                <button type="submit">Search</button>
            </form>
        </div>
    )
}