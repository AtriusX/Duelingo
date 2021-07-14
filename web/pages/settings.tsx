import { NextPageContext } from "next";
import { homeRedirect } from "../api/auth";
import { self, update, UpdateInfo, User } from "../api/user"
import Navbar from '../components/Navbar'
import { tryLogout } from '../api/auth'
import Link from "next/link"
import styles from "../styles/Settings.module.css"
import { animate, getData } from "../utils";
import { FormEvent, useState } from "react";
import router from "next/router";
import Avatar from "../components/Avatar";

interface SettingsProps {
    user: User
}

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
            <div className={styles.body}>
                <h1>Account Settings</h1>
                <div className={styles.container}>
                    <div className={styles.panels}>
                        <div>
                            <form autoComplete="off" method="POST" onSubmit={e => updateAccount(e, notify, true)}>
                                <div className={styles.avatarcontainer}>
                                    <Avatar user={user} className={styles.avatar} />
                                    <div className={styles.details}>
                                        <h2>{user.username}</h2>
                                        <input type="text" name="status" id="status" placeholder="Status" />
                                    </div>
                                </div>
                                <label htmlFor="description">Description:</label>
                                <textarea name="description" id="description" cols={30} rows={6} placeholder="Description..." />
                                <button type="submit">Update Profile</button>
                            </form>
                        </div>
                        <div>
                            <form autoComplete="off" method="POST" onSubmit={e => updateAccount(e, notify)}>
                                <label htmlFor="username">Username</label>
                                <input type="text" id="username" minLength={3} placeholder={user.username} />
                                <br />
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder={user.email} />
                                <br />
                                <label htmlFor="password">New Password</label>
                                <input type="password" id="password" minLength={8} placeholder="New Password" />
                                <br />
                                <label htmlFor="password">Confirm Password</label>
                                <input type="password" id="confirm" minLength={8} placeholder="Confirm Password" />
                                <br />
                                <button type="submit">Update Account</button>
                            </form>
                        </div>
                    </div>
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

// const redirect = (res: any, fail: ErrorCallback = () => { }) =>
//     res === true || !!res?.id ? router.reload() : fail(res)

async function updateAccount(event: SubmitEvent, fail: ErrorCallback, skipPassword?: boolean) {
    event.preventDefault()
    let { username, email, password, confirm, description } = getData<UpdateInfo>(event.target)
    if (!skipPassword && password !== confirm)
        return fail({ message: "Confirmation password is not the same!" })
    await update({ username: username, email, password, description })
    router.reload()
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    return user ? {
        props: { user }
    } : homeRedirect
}