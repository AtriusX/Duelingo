import { NextPageContext } from "next";
import { emailRegex, homeRedirect } from "../api/auth";
import { ConfirmationInfo, deleteAccount, self, Token, update, UpdateInfo } from "../api/user"
import Navbar from '../components/Navbar'
import { tryLogout } from '../api/auth'
import Link from "next/link"
import styles from "../styles/Settings.module.css"
import { animate, defaultSocket, getData } from "../utils";
import { FormEvent, useState } from "react";
import router from "next/router";
import Avatar from "../components/Avatar";
import ReactModal from "react-modal";
import { Error, User } from "../api"
import Title from "../components/Title";
import ChallengeRequests from "../components/ChallengeRequests";
interface SettingsProps {
    user: User & Token
}

type SubmitEvent = FormEvent<HTMLFormElement>

type ErrorCallback = (err: Error) => void

export default function Settings({ user }: SettingsProps) {
    const [error, setError] = useState<string | null>()
    const [modal, setModal] = useState(false)
    const notify = (err: Error) => {
        setError(err.message)
        animate("#error", styles.shake)
    }
    return <>
        <ChallengeRequests user={user} socket={defaultSocket(() => {}, "open", user.token)} />
        <Title title="Settings" />
        <Navbar redirect="/search" user={user}>
            <Link href={`/profile/${user?.id}`}>My Profile</Link>
            <Link href={"/settings"}>Settings</Link>
            {/* @ts-ignore */}
            <a onClick={tryLogout}>Logout</a>
        </Navbar>
        <div className={styles.body}>
            <div className={styles.header}>
                <h1>Account Settings</h1>
                <button onClick={() => setModal(true)}>Delete Account</button>
            </div>
            <div className={styles.container}>
                <div className={styles.panels}>
                    <div>
                        <form autoComplete="off" method="POST" onSubmit={e => updateAccount(e, notify)}>
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
                            <input type="text" id="username" name="username"
                                minLength={3} maxLength={20} placeholder={user.username} />
                            <br />
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email"
                                placeholder={user.email} pattern={emailRegex.source} />
                            <br />
                            <label htmlFor="password">New Password</label>
                            <input type="password" id="password" name="password"
                                minLength={8} maxLength={20} placeholder="New Password" />
                            <br />
                            <label htmlFor="password">Existing Password</label>
                            <input type="password" id="existing" name="existing"
                                minLength={8} maxLength={20} placeholder="Existing Password" />
                            <br />
                            <button type="submit">Update Account</button>
                        </form>
                    </div>
                </div>
            </div>
            <div
                id="error"
                className={styles.error}
                hidden={!error}
                onClick={() => setError(null)}>
                {error}
            </div>
            <Modal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
            />
        </div>
    </>
}

function Modal(props: ReactModal.Props) {
    const [error, setError] = useState<string | null>()
    return (
        <ReactModal
            {...props}
            ariaHideApp={false}
            shouldCloseOnEsc
            className={styles.modal}
            style={{
                overlay: {
                    background: "var(--modalback)"
                }
            }}>
            <h1>Warning</h1>
            <p>The action you are about to take cannot be undone!
                If you are absolutely sure you would like to continue,
                please type in your password and then hit confirm.
                Otherwise, please click outside or press escape to go back.</p>
            <form autoComplete="off" method="DELETE" onSubmit={async e => {
                let res = await tryDelete(e) as Error
                if (res && res.message)
                    setError(res.message)
            }}>
                <input type="password" id="password" name="password" placeholder="Password" />
                <button type="submit">Confirm</button>
            </form>
            <div
                className={styles.confirmerror}
                hidden={!error}
                onClick={() => setError(null)}>
                {error}
            </div>
        </ReactModal>
    )
}

async function tryDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    let data = getData<ConfirmationInfo>(e.target)
    let res = await deleteAccount(data)
    let body: any = res

    if (!body.message)
        router.push("/")
    else
        return body

}

async function updateAccount(event: SubmitEvent, fail: ErrorCallback) {
    event.preventDefault()
    let data = getData<UpdateInfo>(event.target)
    let res = await update(data) as any
    if (!res)
        router.reload()
    else
        return fail(res)
}

export async function getServerSideProps({ req }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    return user ? {
        props: { user }
    } : homeRedirect
}