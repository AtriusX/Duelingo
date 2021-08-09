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
import Pane from "../../components/Pane";
import Title from "../../components/Title";
import ChallengeRequests from "../../components/ChallengeRequests";
import GameResult from "../../components/GameResult";
import { useCallback, useEffect, useState } from "react";
import Loader from "../../components/Loader";

interface ProfileData {
    user?: User | Error
    me?: User & Token
    rival: Rivalry,
}

type Hide = () => void

export default function Profile({ user, me, rival }: ProfileData) {
    const socket = useSocket(() => { }, { token: me })
    const [id, setId] = useState(cast<User>(user).id)
    const [games, setGames] = useState<GameRes[]>()
    const [rivals, setRivals] = useState<NamedRivalry[]>()
    const [gamePage, incGamePage, , resetGamePage] = useCounter()
    const [rivalPage, incRivalPage, , resetRivalPage] = useCounter()

    const getRivals = useCallback(async (v: boolean = true, hide?: Hide) => {
        if (!v) return
        const same = cast<User>(user)?.id === me?.id
        const res = same ? await all(me?.id, rivalPage) : await active(cast<User>(user).id, rivalPage)
        if (!res.length) {
            if (!rivals) setRivals([])
            return hide && hide()
        }
        setRivals([...rivals ?? [], ...res])
        incRivalPage()
        if (res.length < 50 && hide)
            hide()
    }, [incRivalPage, me?.id, rivalPage, rivals, user])

    const getGameResults = useCallback(async (v: boolean = true, hide?: Hide) => {
        if (!v) return
        let res = await getGames(id, gamePage) ?? []
        if (!res.length) {
            if (!games) setGames([])
            return hide && hide()
        }
        setGames([...games ?? [], ...res])
        incGamePage()
        if (res.length < 50 && hide)
            hide()
    }, [gamePage, games, id, incGamePage])

    useEffect(() => {
        let u = cast<User>(user)
        if (u.id === id) return
        setId(u.id)
        resetGamePage()
        setGames(undefined)
        resetRivalPage()
        setRivals(undefined)
        getRivals()
        getGameResults()
    }, [resetGamePage, user, resetRivalPage, id, getRivals, getGameResults])

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
                    <Pane className={styles.games} emptyIcon="🎮" emptyText="No past games!" items={games ?? [undefined]}>
                        <h3>Games</h3>
                        {games?.map((g, i) => <GameResult key={i} result={g} />)}
                        <Loader action={getGameResults} />
                    </Pane>
                    <Pane className={styles.rivals} emptyIcon="🌞" emptyText="No Rivals!" items={rivals ?? [undefined]}>
                        <h3>Rivals</h3>
                        {rivals?.map((r, i) => <RivalItem key={i} me={me} self={cast<User>(user)} rivalry={r} />)}
                        <Loader action={getRivals} />
                    </Pane>
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