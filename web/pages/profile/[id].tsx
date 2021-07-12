import { NextPageContext } from "next";
import { getUser, self } from "../../api/user";
import Avatar from "../../components/Avatar";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Profile.module.css"
import Link from "next/link"
import { tryLogout } from "../../api/auth";
type User = {
    id: number
    displayName: string
    joined: string
    language: string
    rank: string
}
interface ProfileData {
    user: User
    me?: User 
}

export default function Profile({ user, me }: ProfileData) {
    const { displayName, joined, language, rank } = user
    return (
        <>
            <Navbar redirect="/search" user={me}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div className={styles.body}>
                <div className={styles.profile}>
                    <h1>({rank}) {displayName}</h1>
                    <Avatar user={user} className={styles.avatar} />
                    <h2>{language}</h2>
                    <h3>Joined on {new Date(joined).toDateString()}</h3>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    const user = await getUser(query.id)
    const me = await self(req?.headers.cookie)
    return {
        props: { user, me }
    }
}