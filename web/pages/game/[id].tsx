import { NextPageContext } from "next";
import { User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self, Token } from "../../api/user";
import Title from "../../components/Title";
import { defaultSocket } from "../../utils";

interface GameProps {
    user: User & Token
}

export default function Game({ user }: GameProps) {
    const socket = defaultSocket(() => { }, "game", user.token)
    return (
        <div>
            <Title title="Game Page" />
            Game Page!
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}