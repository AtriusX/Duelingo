import { HTMLProps, useEffect } from "react";
import { SearchQuery } from "../api/user";
import styles from '../styles/Searchbar.module.css'
import { getData } from "../utils";

export interface SearchbarProps extends HTMLProps<HTMLFormElement> {
    redirect?: string
    value?: string | string[]
}

export default function Searchbar({ redirect, value, className, onSubmit, ...others }: SearchbarProps) {
    useEffect(() => {
        const search = document.getElementById("query")
        document.addEventListener("keydown", e => {
            if (e?.key === "/") {
                e.preventDefault()
                search?.focus()
            }
        })
    })

    const submit = onSubmit ?? (async e => {
        const data = getData<SearchQuery>(e.target)
        if (!data.query.length)
            e.preventDefault();
    })

    return (
        <div className={`${className} ${styles.searchbar}`}>
            <form autoComplete="off" {...others} onSubmit={submit} action={redirect}>
                <input type="text" placeholder="Search" name="query" id="query" defaultValue={value} />
                <button type="submit">Search</button>
            </form>
        </div>
    )
}