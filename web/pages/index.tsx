import { NextPageContext } from 'next'
import { getStats, getUpdates, self, Stats, Token, Update } from '../api/user'
import { User } from "../api/"
import styles from '../styles/Index.module.css'
import Home from "../components/Home"
import Landing from "../components/Landing"
import Head from "next/head"
interface Data {
  user?: User & Token
  // updates?: (page: number) => Promise<Update[]>,
  stats?: Stats
}

export default function Index({ user, stats }: Data) {
  return <div className={styles.container}>
    <Head>
      <title>Home</title>
    </Head>
    {!!user ? <Home user={user} stats={stats} /> : <Landing />}
  </div>
}

export async function getServerSideProps({ req }: NextPageContext) {
  const user = await self(req?.headers.cookie)
  // const updates = async (page: number) => {
  //   return await getUpdates(page, req?.headers.cookie)
  // }
  const stats = await getStats(req?.headers.cookie)
  return {
    props: { user, stats }
  }
}
