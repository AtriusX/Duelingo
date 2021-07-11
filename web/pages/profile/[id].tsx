import { NextPageContext } from "next";
import { getUser } from "../../api/user";

interface ProfileData {
    user: {
        id: number
        displayName: string
        joined: string
        language: string
        rank: string
    }
}

export default function Profile({ user }: ProfileData) {
    const { displayName, joined } = user
    return (
        <div>
            <h1>{displayName}</h1>
            <h3>Joined on {new Date(joined).toDateString()}</h3>
        </div>
    )
}

export async function getServerSideProps({ query }: NextPageContext) {
    const user = await getUser(query.id)
    return { 
        props: { user } 
    }
}