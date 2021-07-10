import { NextPageContext } from 'next'
import Link from 'next/link'
import router from 'next/router'
import { logout } from '../api/auth'
import { self } from '../api/user'
interface Data {
  displayName?: string
}

export default function Home({ displayName }: Data) {
  return <div className={"container"}>
    {!!displayName ? <>
      <h1>Hello {displayName}!</h1>
      <button onClick={tryLogout}>Logout</button>
    </> : <>
      <Link href="/signin"><a>Login</a></Link>
    </>}
  </div>
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