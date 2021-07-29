import router from "next/router"
import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { QueryRes, search, SearchQuery, Token } from '../api/user'
import { defaultSocket, getData } from "../utils"
import styles from '../styles/Search.module.css'
import { NextPageContext } from "next"
import SearchItem from "../components/SearchItem"
import Navbar from "../components/Navbar"
import { self } from '../api/user'
import Link from "next/link"
import { tryLogout } from "../api/auth"
import Dropdown from "../components/Dropdown"
import Paginator from "../components/Paginator"
import Pane from "../components/Pane"
import { User } from "../api"
import Head from "next/head"
import ChallengeRequests from "../components/ChallengeRequests"

interface SearchData {
    user?: User & Token
    query: any
    queryRes: QueryRes | null
}

export default function Search({ user, query, queryRes }: SearchData) {
    const [users, setUsers] = useState<QueryRes | null>(query.query ? queryRes : null)
    return (
        <>
            {user ? <ChallengeRequests user={user} socket={defaultSocket(() => { }, "open", user.token)} /> : null}
            <div className={styles.body}>
                <Head>
                    <title>Search</title>
                </Head>
                <Navbar name="query" value={query.query} user={user} className={styles.navbar}
                    onSubmit={async e => await performSearch(e, setUsers)}>
                    <Link href={`/profile/${user?.id}`}>My Profile</Link>
                    <Link href={"/settings"}>Settings</Link>
                    <a onClick={() => tryLogout()}>Logout</a>
                </Navbar>
                <div className={styles.grid}>
                    <aside className={styles.options}>
                        <Filters query={query} />
                    </aside>
                    <main>
                        <div>
                            {users ? getResults(users, query.page ?? 1) : null}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

function Filters({ query }: any) {
    return (
        <>
            <h1>Search Tools</h1>
            <hr />
            <div id="filters" className={styles.tools}>
                <label htmlFor="rank">Rank:</label>
                <Dropdown useIndex reverseIndex className={styles.filter}
                    id="rank" name="rank" defaultValue={1} trail="or above">
                    <p>S</p>
                    <p>A</p>
                    <p>B</p>
                    <p>C</p>
                    <p>D</p>
                </Dropdown>
                <label htmlFor="order">Order:</label>
                <Dropdown className={styles.filter} id="order"
                    name="order" defaultValue={query.order ?? "Ascending"}>
                    <p>Ascending</p>
                    <p>Descending</p>
                </Dropdown>
            </div>
        </>
    )
}

function getResults(
    users: QueryRes | null,
    page: number
) {
    if (!users) return null
    const [res, count] = users as [User[], number]
    const pageCount = Math.ceil(count / 50) || 1
    return (
        <Pane className={styles.results} emptyIcon="😢"
            emptyText="Sorry... we found no results!" items={count}>
            <div className={styles.pageinfo}>
                <p>{count} result(s) found.</p>
                <Paginator page={page} pageCount={pageCount} buttonCount={7} click={toPage} />
                {page > pageCount && page != 1 ? <p>Out of bounds!</p>
                    : <p>Page {Math.max(1, page)} of {pageCount}</p>}
            </div>
            {res.map((u, i) => <SearchItem key={i} user={u} />)}
            {res.length == 50 ?
                <Paginator className={styles.bottompager} page={page}
                    pageCount={pageCount} buttonCount={7} click={toPage} />
                : null}
        </Pane>
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
        delete data.page // Reset the page
        setUsers(await search(data))
        router.push({
            query: data
        })
    }
}

async function toPage(page: number) {
    const query = router.query as any
    query.page = page
    await router.push({
        query
    })
    router.reload()
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    const data = query as SearchQuery
    const users = await search(data)

    return {
        props: {
            user: user,
            query: data ?? null,
            queryRes: users ?? null
        }
    }
}