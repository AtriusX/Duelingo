import styles from '../styles/Login.module.css'
import router from 'next/router'
import { getData } from '../utils'
import { login, register } from '../api/auth'
import { FormEvent } from 'react'
import { NextPageContext } from 'next'
import { self } from '../api/user'

type SubmitEvent = FormEvent<HTMLFormElement>

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

export default function Signup({ authenticated }: Data) {
    if (authenticated)
        redirect(true)
    return (
        <div className={styles.container}>
            <form method="post" onSubmit={tryLogin}>
                <label htmlFor="email">Email:</label>
                <input type="email" pattern="[\w\d]+@[\w\d]+.[\w\d]+" id="email" placeholder="johnsmith@email.com" />
                <br />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" placeholder="Password" />
                <br />
                <button type="submit">Log In</button>
            </form>
            <form method="post" onSubmit={tryRegister}>
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
    )
}

async function tryLogin(event: SubmitEvent) {
    event.preventDefault()
    let { email, password } = getData<LoginInfo>(event.target)
    let user = await login(email, password)
    redirect(user)
}

async function tryRegister(event: SubmitEvent) {
    event.preventDefault()
    let { username, email, password, confirm } = getData<RegistrationInfo>(event.target)                
    if (password !== confirm)
        return console.log("Password is not the same!")
    let user = await register(email, username, password)
    redirect(user)
}

export async function getServerSideProps(ctx: NextPageContext) {        
    return {
        props: {
            authenticated: !!(await self(ctx.req?.headers.cookie))
        }
    }
}

// Redirects to the home page if the id is present or if forced
const redirect = (res: any) => 
    res?.id || res === true ? router.push("/") : console.log(res)

