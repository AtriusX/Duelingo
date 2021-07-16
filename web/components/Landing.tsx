import styles from "../styles/Landing.module.css"
import Link from "next/link"

export default function Landing() {
  return (
    <div className={styles.body}>
      <div className={styles.landingback} />
      <div className={styles.landing}>
        <div>
          <h1>Welcome to Duelingo!</h1>
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