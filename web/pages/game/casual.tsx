import { NextPageContext } from "next";
import { User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self, Token } from "../../api/user"
import Title from "../../components/Title";
import FindRival from "../../components/FindRival"
import styles from "../../styles/Casual.module.css"
import router from "next/router";

interface CasualProps {
    user: User & Token
}

export default function Casual({ user }: CasualProps) {
    return (
        <div>
            <button className={styles.back}
                onClick={() => router.push("/")}>Back</button>
            <div className={styles.box}>
                <Title title={"Casual Matchmaking"} />
                <FindRival className={styles.selector} user={user} />
            </div>
        </div>
    )
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    return { props: { user } }
}