import { NextPageContext } from 'next'
import Link from 'next/link'
import router from 'next/router'
import { logout } from '../api/auth'
import { SearchQuery, self } from '../api/user'
import Searchbar from '../components/searchbar'
import { getData } from '../utils'
interface Data {
  displayName?: string
}

export default function Index({ displayName }: Data) {
  return <div className={"container"}>
    {!!displayName ? <Home displayName={displayName} /> : <Landing />}
  </div>
}

function Home({ displayName }: Data) {
  return (
    <>
      <Searchbar name="query" redirect="/search" onSubmit={async e => {
        const data = getData<SearchQuery>(e.target)
        if (!data.query.length)
          e.preventDefault();
      }} />
      <h1>Welcome back {displayName}!</h1>
      <button onClick={tryLogout}>Logout</button>
    </>
  )
}

function Landing() {
  return (
    <Link href="/signin">
      <a>Login</a>
    </Link>
  )
}

async function tryLogout() {
  await logout()
  router.reload()
}

export async function getServerSideProps(ctx: NextPageContext) {
  const { displayName } = await self(ctx.req?.headers.cookie) ?? {}
  return {
    props: { 
      displayName: displayName ?? null 
    }
  }
}