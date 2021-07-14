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
import Dropdown from "../components/Dropdown"

interface SearchData {
    user: User
    query: any
    queryRes: any[] | null
}

export default function Search({ user, query, queryRes }: SearchData) {
    const [users, setUsers] = useState<any[] | null>(queryRes)
    return (
        <div className={styles.body}>
            <Navbar name="query" value={query.query} user={user}
                onSubmit={async e => await performSearch(e, setUsers)}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div className={styles.grid}>
                <div className={styles.options}>
                    <h2>Search Tools</h2>
                    <div id="filters" className={styles.tools}>
                        <label htmlFor="rank">Rank:</label>
                        <Dropdown className={styles.rank} id="rank" name="rank" defaultValue={query.rank ?? "D"} trail="or above">
                            <p>S</p>
                            <p>A</p>
                            <p>B</p>
                            <p>C</p>
                            <p>D</p>
                        </Dropdown>
                        <br />
                        <label htmlFor="order">Order:</label>
                        <Dropdown className={styles.rank} id="order" name="order" defaultValue={query.order ?? "Descending"}>
                            <p>Ascending</p>
                            <p>Descending</p>
                        </Dropdown>
                    </div>
                </div>
                <div className={styles.results}>
                    {getResults(users)}
                </div>
            </div>
        </div>
    )
}

async function performSearch(
    e: FormEvent<HTMLFormElement>,
    setUsers: Dispatch<SetStateAction<any[] | null>>
) {
    e.preventDefault()
    let data = router.query as any
    let query = getData<SearchData>(e.target)
    if (query.query.length) {
        data.query = query.query
        setUsers(await search(data) as unknown as any[])
        router.push({
            query: data
        })
    }
}

function getResults(users: User[] | null, fail: JSX.Element = <NoResults />) {
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
            query: data ?? null,
            queryRes: data.query?.length || users?.length ? users : null
        }
    }
}

function NoResults() {
    return (
        <h1>No results found.</h1>
    )
}