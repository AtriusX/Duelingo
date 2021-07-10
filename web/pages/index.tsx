import { NextPageContext } from 'next'
import Link from 'next/link'
import router from 'next/router'
import { logout } from '../api/auth'
import { self } from '../api/user'
interface Data {
  displayName?: string
}

export default function Index({ displayName }: Data) {
  return <div className={"container"}>
    {!!displayName ? <Home displayName={displayName} /> : <Landing /> }
  </div>
}

function Home({ displayName }: Data) {
  return (
    <>
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
  const user = await self(ctx.req?.headers.cookie)
  return {
    props: {
      displayName: user?.displayName ?? null
    }
  }
}