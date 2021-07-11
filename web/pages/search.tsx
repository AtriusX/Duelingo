import router from "next/router"
import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { search, SearchQuery } from '../api/user'
import Searchbar from "../components/searchbar"
import { getData } from "../utils"
import styles from '../styles/Search.module.css'
import { NextPageContext } from "next"

interface SearchData {
    query: string
    queryRes: any[] | null
}

export default function Search({ query, queryRes }: SearchData) {
    const [users, setUsers] = useState<any[] | null>(queryRes)
    return <div>
        <Searchbar name="query" value={query} className={styles.search}
            onSubmit={async e => await performSearch(e, setUsers)} />
        <div>{getResults(users)}</div>
    </div>
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

function getResults(users: any[] | null) {
    if (users === null)
        return ""
    return !users?.length ? <h1>No results found.</h1> : users?.map((u, i) => <p key={i}>{JSON.stringify(u)}</p>)
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