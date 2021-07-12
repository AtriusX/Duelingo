import { NextPageContext } from 'next'
import Link from 'next/link'
import { tryLogout } from '../api/auth'
import { self } from '../api/user'
import Navbar from '../components/Navbar'
import styles from '../styles/Index.module.css'

interface Data {
  user?: { id: number, displayName: string }
}

export default function Index({ user }: Data) {
  return <div className={styles.container}>
    {!!user ? <Home user={user} /> : <Landing />}
  </div>
}

function Home({ user }: Data) {
  return (
    <>
      <Navbar redirect="/search" user={user}>
        <Link href={`/profile/${user?.id}`}>My Profile</Link>
        <Link href={"/settings"}>Settings</Link>
        <a onClick={tryLogout}>Logout</a>
      </Navbar>
      <div className={styles.body}>
        <h1>Welcome back {user?.displayName}!</h1>
      </div>
    </>
  )
}

function Landing() {
  return (
    <div className={styles.body}>
      <Link href="/signin">
        <a>Login</a>
      </Link>
    </div>
  )
}

export async function getServerSideProps({ req }: NextPageContext) {
  const user = await self(req?.headers.cookie)
  return {
    props: { user: user ?? null }
  }
}