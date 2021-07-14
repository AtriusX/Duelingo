import { NextPageContext } from "next";
import { getUser, self, User } from "../../api/user";
import Avatar from "../../components/Avatar";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Profile.module.css"
import Link from "next/link"
import { tryLogout } from "../../api/auth";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { getRank } from "../../utils";
interface ProfileData {
    user: User
    me?: User
}

export default function Profile({ user, me }: ProfileData) {
    const { username, joined, rank, description } = user
    return (
        <>
            <Navbar redirect="/search" user={me}>
                <Link href={`/profile/${me?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div className={styles.body}>
                <div>
                    <div className={styles.profile}>
                        <h2><b>({getRank(rank)})</b> {username}</h2>
                        <hr />
                        <div className={styles.avatarcontainer}>
                            <Avatar user={user} className={styles.avatar} />
                        </div>
                        <div>
                            <h2>{getUnicodeFlagIcon("US")}</h2>
                            <h3>Joined on {new Date(joined).toLocaleDateString()}</h3>
                            <hr />
                            <p>{description ? description : "No description provided."}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.games}>
                    <h3>No past games!</h3>
                </div>
                <div className={styles.rivals}>
                    <h3>No rivals!</h3>
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