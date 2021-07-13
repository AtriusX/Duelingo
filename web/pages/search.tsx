import router from "next/router"
import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { search, SearchQuery, User } from '../api/user'
import { getData } from "../utils"
import styles from '../styles/Search.module.css'
import { NextPageContext } from "next"
import SearchItem from "../components/SearchItem"
import Navbar from "../components/Navbar"
import { self } from '../api/user'
import Link from "next/link"
import { tryLogout } from "../api/auth"

interface SearchData {
    user: User
    query: string
    queryRes: any[] | null
}

export default function Search({ user, query, queryRes }: SearchData) {
    const [users, setUsers] = useState<any[] | null>(queryRes)
    return (
        <div>
            <Navbar name="query" value={query} user={user}
                onSubmit={async e => await performSearch(e, setUsers)}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div className={styles.results}>{getResults(users)}</div>
        </div>
    )
}

async function performSearch(
    e: FormEvent<HTMLFormElement>,
    setUsers: Dispatch<SetStateAction<any[] | null>>
) {
    e.preventDefault()
    let data = getData<SearchQuery>(e.target)
    if (data.query.length) {
        setUsers(await search(data))
        router.push({
            query: data
        }, undefined, { shallow: true })
    }
}

function getResults(users: User[] | null, fail: JSX.Element = <h1>No results found.</h1>) {
    if (!users) return null
    if (!users.length) return fail
    return users.map((u, i) => <SearchItem key={i} user={u} />)
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    const data = query as SearchQuery
    const users = await search(data)
    return {
        props: {
            user: user ?? null,
            query: data.query ?? null,
            queryRes: data.query?.length || users?.length ? users : null
        }
    }
}