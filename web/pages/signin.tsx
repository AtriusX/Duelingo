import styles from '../styles/Login.module.css'
import router from 'next/router'
import { getData } from '../utils'
import { login, register } from '../api/auth'
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

interface Data {
    authenticated: boolean
}

// Redirects to the home page if the id is present or if forced
const redirect = (res: any, fail: ErrorCallback = () => {}) =>
    res === true || !!res?.id ? router.push("/") : fail(res)

export default function Signup({ authenticated }: Data) {
    if (authenticated)
        redirect(true)
    const [login, isLogin] = useState(true)
    const [error, setError] = useState<string | null>()
    function notify(err: Error) {
        setError(err.message)
    }
    return (
        <div>
            <div className={styles.window}>
                <div className={styles.container}>
                    <button className={styles.login} onClick={() => {
                        isLogin(true)
                        setError(null)
                    }}>Login</button>
                    <button className={styles.register} onClick={() => {
                        isLogin(false)
                        setError(null)

                    }}>Register</button>
                    <form hidden={!login} method="post" onSubmit={e => tryLogin(e, notify)}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" pattern="[\w\d]+@[\w\d]+.[\w\d]+" id="email" placeholder="johnsmith@email.com" />
                        <br />
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" placeholder="Password" />
                        <br />
                        <button type="submit">Log In</button>
                    </form>
                    <form hidden={login} method="post" onSubmit={e => tryRegister(e, notify)}>
                        <label htmlFor="username">Name:</label>
                        <input type="text" id="username" minLength={3} placeholder="John Smith" />
                        <br />
                        <label htmlFor="email">Email:</label>
                        <input type="email" pattern="[\w\d]+@[\w\d]+.[\w\d]+" id="email" placeholder="johnsmith@email.com" />
                        <br />
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" min={8} placeholder="Password" />
                        <br />
                        <label htmlFor="confirm">Confirm:</label>
                        <input type="password" id="confirm" min={8} placeholder="Confirm Password" />
                        <br />
                        <button type="submit">Register</button>
                    </form>
                </div>
                <div className={styles.error} hidden={!error} onClick={() => setError(null)}>
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
    let { username, email, password, confirm } = getData<RegistrationInfo>(event.target)
    if (password !== confirm)
        return fail({ message: "Password is not the same!" })
    let user = await register(email, username, password)
    redirect(user, fail)
}

export async function getServerSideProps(ctx: NextPageContext) {
    return {
        props: {
            authenticated: !!(await self(ctx.req?.headers.cookie))
        }
    }
}
