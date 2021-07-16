import styles from '../styles/Signin.module.css'
import router from 'next/router'
import { animate, getData } from '../utils'
import { homeRedirect, login, noResult, register } from '../api/auth'
import { FormEvent, useState } from 'react'
import { NextPageContext } from 'next'
import { self } from '../api/user'
import Strength from '../components/Strength'

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

const colors = [
    "#f84747",
    "#ec8743",
    "#e9f546",
    "#22e684"
]

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
    const [pass, setPass] = useState("")
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
                        <input type="email" id="email" name="email" placeholder="Email" />
                        <input type="password" id="password" name="password" minLength={8} placeholder="Password" />
                        <button type="submit">Login</button>
                    </form>
                    <form hidden={login} method="post" onSubmit={e => tryRegister(e, notify)}>
                        <h1>Register</h1>
                        <input type="text" id="username" name="username" minLength={3} placeholder="Name" />
                        <input type="email" id="email" name="email" placeholder="Email" />
                        <input type="password" id="password" name="password" minLength={8} placeholder="Password" onChange={e => setPass(e.target.value)} />
                        <input type="password" id="confirm" name="confirm" minLength={8} placeholder="Confirm Password" />
                        <Strength input={pass} colors={colors} maxScore={20} />
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
    let { username, email, password, confirm } = getData<RegistrationInfo>(event.target)
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
