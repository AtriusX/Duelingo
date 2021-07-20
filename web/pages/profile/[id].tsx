import { NextPageContext } from "next";
import { getUser, self } from "../../api/user";
import Avatar from "../../components/Avatar";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Profile.module.css"
import Link from "next/link"
import { tryLogout } from "../../api/auth";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { cast, getRank } from "../../utils";
import NoResult from "../../components/NoResult";
import router from "next/router";
import RivalButton from "../../components/RivalButton";
import { active, all, get } from "../../api/rival";
import { NamedRivalry, Rivalry, User } from "../../api/"
import RivalItem from "../../components/RivalItem"
import Pane from "../../components/Pane";
import Head from "next/head";

interface ProfileData {
    user?: User | Error
    me?: User
    rival: Rivalry,
    rivals?: NamedRivalry[]
}

export default function Profile({ user, me, rival, rivals }: ProfileData) {
    if (!user)
        return (
            <NoResult message="It seems a bit empty in here..." emoji="🌌" className={styles.emptycenter}>
                <button onClick={() => router.push("/")}>Go Home</button>
            </NoResult>
        )
    const { username, joined, rank, description } = user as User
    return (
        <div className={styles.body}>
            <Head>
                <title>{username}{"'"}s Profile</title>
            </Head>
            <Navbar redirect="/search" user={me}>
                <Link href={`/profile/${me?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div className={styles.container}>
                <div className={styles.profile}>
                    <h3>
                        <div><b>({getRank(rank)})</b> {username}</div>
                        <RivalButton self={me} user={cast<User>(user)} state={rival} />
                    </h3>
                    <hr />
                    <div className={styles.avatarcontainer}>
                        <Avatar user={user as User} className={styles.avatar} />
                    </div>
                    <div>
                        <h2>{getUnicodeFlagIcon("US")}</h2>
                        <h3>Joined on {new Date(joined).toLocaleDateString()}</h3>
                        <hr />
                        <p>{description ? description : "No description provided."}</p>
                    </div>
                </div>
                <Pane className={styles.games} emptyIcon="🎮" emptyText="No past games!">
                    <h3>Games</h3>
                </Pane>
                <Pane className={styles.rivals} emptyIcon="🌞" emptyText="No Rivals!" items={rivals}>
                    <h3>Rivals</h3>
                    {rivals?.map((r, i) => <RivalItem key={i} me={me} self={cast<User>(user)} rivalry={r} />)}
                </Pane>
            </div>
        </div>
    )
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    const user = await getUser(query.id)
    const token = req?.headers.cookie
    const me = await self(token)
    const same = cast<User>(user)?.id === me?.id
    const rivals = same ? await all(query?.id) : await active(query?.id) ?? null
    const rivalry = same ? null : await get(cast<User>(user).id, token!)

    return {
        props: {
            user: !!(user as any)?.error ? null : user,
            me,
            rival: rivalry,
            rivals
        }
    }
}