import styles from '../styles/Signin.module.css'
import router from 'next/router'
import { animate, getData } from '../utils'
import { homeRedirect, login, noResult, register } from '../api/auth'
import { FormEvent, useState } from 'react'
import { NextPageContext } from 'next'
import { self } from '../api/user'

type SubmitEvent = FormEvent<HTMLFormElement>
type ErrorCallback = (err: Error) => void
interface Error {
    message: string
}

interface LoginInfo {
    email: string
    password: string
}

interface RegistrationInfo extends LoginInfo {
    username: string
    confirm: string
}

// Redirects to the home page if the id is present or if forced
const redirect = (res: any, fail: ErrorCallback = () => { }) =>
    res === true || !!res?.id ? router.push("/") : fail(res)

interface SignupProps {
    toRegister?: boolean
}

export default function Signup({ toRegister }: SignupProps) {
    const [login, isLogin] = useState(!toRegister)
    const [error, setError] = useState<string | null>()
    const notify = (err: Error) => {
        setError(err.message)
        animate("#error", styles.shake)
    }
    const swap = (login: boolean) => {
        isLogin(login)
        setError(null)
    }
    return (
        <div className={styles.backdrop}>
            <div className={styles.img} />
            <button className={styles.back} onClick={() => redirect(true)}>Back</button>
            <div className={styles.window}>
                <div className={styles.container}>
                    <div className={styles.toggle}>
                        <button className={styles.login} onClick={() => swap(true)}>Login</button>
                        <button className={styles.register} onClick={() => swap(false)}>Register</button>
                    </div>
                    <form hidden={!login} method="post" onSubmit={e => tryLogin(e, notify)}>
                        <h1>Log In</h1>
                        <input type="email" id="email" placeholder="Email" />
                        <br />
                        <input type="password" id="password" minLength={8} placeholder="Password" />
                        <br />
                        <button type="submit">Login</button>
                    </form>
                    <form hidden={login} method="post" onSubmit={e => tryRegister(e, notify)}>
                        <h1>Register</h1>
                        <input type="text" id="username" minLength={3} placeholder="Name" />
                        <br />
                        <input type="email" id="email" placeholder="Email" />
                        <br />
                        <input type="password" id="password" minLength={8} placeholder="Password" />
                        <br />
                        <input type="password" id="confirm" minLength={8} placeholder="Confirm Password" />
                        <br />
                        <button type="submit">Register</button>
                    </form>
                </div>
                <div id="error" className={styles.error} hidden={!error} onClick={() => setError(null)}>
                    {error}
                </div>
            </div>
        </div>
    )
}

async function tryLogin(event: SubmitEvent, fail: ErrorCallback) {
    event.preventDefault()
    let { email, password } = getData<LoginInfo>(event.target)
    let user = await login(email, password)
    redirect(user, fail)
}

async function tryRegister(event: SubmitEvent, fail: ErrorCallback) {
    event.preventDefault()
    let { username, email, password, confirm } = getData<RegistrationInfo>()
    if (password !== confirm)
        return fail({ message: "Confirmation password is not the same!" })
    let user = await register(email, username, password)
    redirect(user, fail)
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    return !!(await self(req?.headers.cookie)) ? homeRedirect : {
        props: {
            toRegister: query.register === "true"
        }
    }
}
