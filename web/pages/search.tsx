import router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { search } from "../api/user"
import { getData } from "../utils"
import { SearchQuery } from "../api/user"
import { Error } from '../api/'

export default function Search() {
    const { query } = useRouter()
    const [users, setUsers] = useState<any[] | null>(null)
    // Wow this is ugly
    useEffect(() => {
        const block = async () => {
            if (!users && query.query)
                setUsers(await search(query as SearchQuery))
        }
        block()
    })
    return <div>
        <form autoComplete={"off"} onSubmit={async e => {
            e.preventDefault()
            const data = getData<SearchQuery>(e.target)
            if (!data.query.length) return;
            setUsers(await search(data as SearchQuery))
            router.push({
                query: data
            })
        }}>
            <input type="text" name="query" id="query" placeholder="Search" defaultValue={query.query} />
            <button type="submit">Search</button>
            <div>{getResults(users)}</div>
        </form>
    </div>
}

function getResults(users: any[] | null) {
    if (users === null) 
        return ""
    return !users?.length ? "No results found." : users?.map((u, i) => <p key={i}>{JSON.stringify(u)}</p>)
}