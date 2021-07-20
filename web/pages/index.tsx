import { NextPageContext } from 'next'
import { self } from '../api/user'
import { User } from "../api/"
import styles from '../styles/Index.module.css'
import Home from "../components/Home"
import Landing from "../components/Landing"
import Head from "next/head"

interface Data {
  user?: User
}

export default function Index({ user }: Data) {
  return <div className={styles.container}>
    <Head>
      <title>Home</title>
    </Head>
    {!!user ? <Home user={user} /> : <Landing />}
  </div>
}

export async function getServerSideProps({ req }: NextPageContext) {
  const user = await self(req?.headers.cookie)
  return {
    props: { user }
  }
}