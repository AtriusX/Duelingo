import { NextPageContext } from "next";
import Head from "next/head";
import { User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self } from "../../api/user"

interface CasualProps {
    self: User
}

export default function Casual({ }: CasualProps) {
    return (
        <div>
            <Head>
                <title>Casual Matchmaking</title>
            </Head>
            Casual Page! Come back later!
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}