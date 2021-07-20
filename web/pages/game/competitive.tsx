import { NextPageContext } from "next";
import { User } from "../../api";
import { self } from "../../api/user";
import { homeRedirect } from "../../api/auth";
import Head from "next/head";

interface CompetitiveProps {
    self: User
}

export default function Competitive({ }: CompetitiveProps) {
    return (
        <div>
            <Head>
                <title>Competitive Matchmaking</title>
            </Head>
            Competitive Page! Come back later!
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}