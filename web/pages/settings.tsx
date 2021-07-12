import { NextPageContext } from "next";
import { homeRedirect } from "../api/auth";
import { self, update } from "../api/user"
import Navbar from '../components/Navbar'
import { tryLogout } from '../api/auth'
import Link from "next/link"
import styles from "../styles/Signin.module.css"
import { animate, getData } from "../utils";
import { FormEvent, useState } from "react";
import router from "next/router";

interface SettingsProps {
    user: { avatar?: string, id: number, displayName: string, email: string }
}

// TODO: Work on this later
export default function Settings({ user }: SettingsProps) {
    const [error, setError] = useState<string | null>()
    const notify = (err: Error) => {
        setError(err.message)
        animate("#error", styles.shake)
    }
    return (
        <>
            <Navbar redirect="/search" user={user}>
                <Link href={`/profile/${user?.id}`}>My Profile</Link>
                <Link href={"/settings"}>Settings</Link>
                <a onClick={tryLogout}>Logout</a>
            </Navbar>
            <div style={{ width: "50%", left: "50%", position: "relative", transform: "translateX(-50%)", padding: "1em 0", fontSize: 13 }}>
                <div className={styles.container}>
                    <form autoComplete="off" method="POST" onSubmit={e => tryUpdate(e, notify)}>
                        <h1>Update</h1>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" minLength={3} placeholder={user.displayName} />
                        <br />
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" placeholder={user.email} />
                        <br />
                        <label htmlFor="password">New Password:</label>
                        <input type="password" id="password" minLength={8} placeholder="New Password" />
                        <br />
                        <label htmlFor="password">Confirm Password:</label>
                        <input type="password" id="confirm" minLength={8} placeholder="Confirm Password" />
                        <br />
                        <button type="submit">Update</button>
                    </form>
                </div>
                <div id="error" className={styles.error} hidden={!error} onClick={() => setError(null)}>
                    {error}
                </div>
            </div>
        </>
    )
}

type SubmitEvent = FormEvent<HTMLFormElement>

type ErrorCallback = (err: Error) => void

interface Error {
    message: string
}

interface UpdateInfo {
    username?: string
    email?: string
    password?: string
    confirm?: string
}

// const redirect = (res: any, fail: ErrorCallback = () => { }) =>
//     res === true || !!res?.id ? router.reload() : fail(res)

async function tryUpdate(event: SubmitEvent, fail: ErrorCallback) {
    event.preventDefault()
    let { username, email, password, confirm } = getData<UpdateInfo>(event.target)
    if (password !== confirm)
        return fail({ message: "Confirmation password is not the same!" })
    await update(username, email, password)
    router.reload()
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    return user ? {
        props: { user: user }
    } : homeRedirect
}