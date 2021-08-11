import { NextPageContext } from "next";
import { GameRes, getGames, getUser, self, Token } from "../../api/user";
import Avatar from "../../components/Avatar";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Profile.module.css"
import Link from "next/link"
import { tryLogout } from "../../api/auth";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { cast, getRank, useCounter } from "../../utils";
import { useSocket } from "../../components/SocketProvider";
import NoResult from "../../components/NoResult";
import router from "next/router";
import RivalButton from "../../components/RivalButton";
import { active, all, get } from "../../api/rival";
import { NamedRivalry, Rivalry, User } from "../../api/"
import RivalItem from "../../components/RivalItem"
import Title from "../../components/Title";
import ChallengeRequests from "../../components/ChallengeRequests";
import GameResult from "../../components/GameResult";
import { useEffect, useState } from "react";
import ScrollFeed from "../../components/ScrollFeed";

interface ProfileData {
    user?: User | Error
    me?: User & Token
    rival: Rivalry,
}

export default function Profile({ user, me, rival }: ProfileData) {
    const socket = useSocket(() => { }, { token: me })
    const [id, setId] = useState(cast<User>(user).id)

    const check = () => {
        let u = cast<User>(user)
        return u.id === id
    }
    useEffect(() => {
        let u = cast<User>(user)
        if (u.id === id) return
        setId(u.id)
    }, [user, id])

    if (!user)
        return (
            <NoResult message="It seems a bit empty in here..." emoji="🌌" className={styles.emptycenter}>
                <button onClick={() => router.push("/")}>Go Home</button>
            </NoResult>
        )
    const { username, joined, rank, description } = user as User
    return (
        <>
            {me && <ChallengeRequests user={me} socket={socket} />}
            <div className={styles.body}>
                <Title title={`${username}'s Profile`} />
                <Navbar redirect="/search" user={me}>
                    <Link href={`/profile/${me?.id}`}>My Profile</Link>
                    <Link href={"/settings"}>Settings</Link>
                    <a onClick={() => tryLogout()}>Logout</a>
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
                    <ScrollFeed<GameRes>
                        text="Games"
                        emptyIcon="🎮"
                        emptyText="No past games!"
                        className={styles.games}
                        action={async p => await getGames(id, p)}
                        map={(g, i) => <GameResult key={i} result={g} />}
                        check={check}
                    />
                    <ScrollFeed<NamedRivalry>
                        text="Rivals"
                        emptyIcon="🌞"
                        emptyText="No Rivals!"
                        className={styles.rivals}
                        action={async p => {
                            const same = cast<User>(user)?.id === me?.id
                            return await (same ? all(me?.id, p) : active(cast<User>(user).id, p))
                        }}
                        map={(r, i) => <RivalItem key={i} me={me} self={cast<User>(user)} rivalry={r} />}
                        check={check}
                    />
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    const user = await getUser(query.id)
    const token = req?.headers.cookie
    const me = await self(token)
    const same = cast<User>(user)?.id === me?.id
    const rival = same ? null : await get(cast<User>(user).id, token!)
    return {
        props: {
            user: !!(user as any)?.error ? null : user, me, rival
        }
    }
}