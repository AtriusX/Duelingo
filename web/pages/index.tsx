import { NextPageContext } from 'next'
import Link from 'next/link'
import { self, User } from '../api/user'
import styles from '../styles/Index.module.css'
import Home from "../components/Home"

interface Data {
  user?: User
}

export default function Index({ user }: Data) {
  return <div className={styles.container}>
    {!!user ? <Home user={user} /> : <Landing />}
  </div>
}

function Landing() {
  return (
    <div className={styles.body}>
      <div className={styles.landingback} />
      <div className={styles.landing}>
        <div>
          <h1>Welcome to Complanguage!</h1>
          <hr />
          <h4>Take your language learning to the next level by competing against your friends and rivals!</h4>
          <div className={styles.buttonbox}>
            <Link href={"/signin"}>Login</Link>
            <Link href={"/signin?register=true"}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ req }: NextPageContext) {
  const user = await self(req?.headers.cookie)
  return {
    props: { user: user ?? null }
  }
}