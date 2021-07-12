import router from "next/router"
import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { search, SearchQuery } from '../api/user'
import Searchbar from "../components/Searchbar"
import { getData } from "../utils"
import styles from '../styles/Search.module.css'
import { NextPageContext } from "next"
import SearchItem from "../components/SearchItem"
import Navbar from "../components/Navbar"

interface SearchData {
    query: string
    queryRes: any[] | null
}

export default function Search({ query, queryRes }: SearchData) {
    const [users, setUsers] = useState<any[] | null>(queryRes)
    return (
        <div>
            <Navbar name="query" value={query}
                onSubmit={async e => await performSearch(e, setUsers)} />
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

function getResults(users: any[] | null, fail: JSX.Element = <h1>No results found.</h1>) {
    if (!users) return null
    if (!users.length) return fail
    return users.map((u, i) => <SearchItem key={i} id={u.id} displayName={u.displayName} joined={u.joined} />)
}

export async function getServerSideProps({ query }: NextPageContext) {
    const data = query as SearchQuery
    const users = await search(data)
    return {
        props: {
            query: data.query ?? null,
            queryRes: data.query?.length || users?.length ? users : null
        }
    }
}