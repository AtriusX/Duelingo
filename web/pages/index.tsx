import { NextPageContext } from 'next'
import { getUpdates, self, Token, Update } from '../api/user'
import { User } from "../api/"
import styles from '../styles/Index.module.css'
import Home from "../components/Home"
import Landing from "../components/Landing"
import Head from "next/head"
interface Data {
  user?: User & Token
  updates?: Update[]
}

export default function Index({ user, updates }: Data) {
  return <div className={styles.container}>
    <Head>
      <title>Home</title>
    </Head>
    {!!user ? <Home user={user} updates={updates} /> : <Landing />}
  </div>
}

export async function getServerSideProps({ req }: NextPageContext) {
  const user = await self(req?.headers.cookie)
  const updates = await getUpdates(req?.headers.cookie)
  return {
    props: { user, updates }
  }
}
