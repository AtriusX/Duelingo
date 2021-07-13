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
    query: string
    queryRes: any[] | null
}

type SearchFilters = {
    userank?: boolean
    rank?: string
    useorder?: boolean
    order?: string
    usedate?: boolean
    direction?: string
    date?: string
}

export default function Search({ user, query, queryRes }: SearchData) {
    const [users, setUsers] = useState<any[] | null>(queryRes)
    return (
        <div className={styles.body}>
            <Navbar name="query" value={query} user={user}
                onSubmit={async e => await performSearch(e, setUsers)}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            {/* TODO: Work on filter options later */}
            <div className={styles.grid}>
                <div className={styles.options}>
                    <h2>Search Tools</h2>
                    <div id="filters" className={styles.tools}>
                        <label htmlFor="rank">Rank</label>
                        <input type="checkbox" name="rank" id="userank" />
                        <Dropdown className={styles.rank} pos={4} id="rank" trail="or above">
                            <p>S</p>
                            <p>A</p>
                            <p>B</p>
                            <p>C</p>
                            <p>D</p>
                        </Dropdown>
                        <br />
                        <label htmlFor="order">Order</label>
                        <input type="checkbox" name="order" id="useorder" />
                        <Dropdown pos={0} className={styles.rank} id="order" >
                            <p>Ascending</p>
                            <p>Descending</p>
                        </Dropdown>
                        <br />
                        <label htmlFor="date">Date</label>
                        <input type="checkbox" name="date" id="usedate" />
                        <Dropdown pos={0} className={styles.rank} id="direction">
                            <p>Before</p>
                            <p>After</p>
                        </Dropdown>
                        <input type="date" className={styles.rank} id="date" />
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
    let data = getData<SearchQuery>(e.target)
    let { userank, useorder, usedate, ...others } = getData<SearchFilters>(document.getElementById("filters")!!)
    if (!userank)
        delete others.rank
    if (!useorder)
        delete others.order
    if (!usedate)
        delete others.direction, others.date
    if (data.query.length) {
        setUsers(await search(data))
        router.push({
            query: { ...data, ...others }
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