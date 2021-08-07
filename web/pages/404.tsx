import styles from "../styles/404.module.css"
import Link from "next/link"
import Title from "../components/Title"

export default function ErrorPage() {
    return (
        <div className={styles.body}>
            <Title title="Error | Not Found" />
            <div className={styles.container}>
                <div>
                    <h2><i>Hey!</i> It looks like you{"'"}re a bit lost!</h2>
                </div>
                <div className={styles.bar} />
                <div>
                    <h3>Lets get you back home.</h3>
                    <Link href={"/"}>
                        <a title="Country Rooooooaaaaaaaaaaaaad" className={styles.home}>
                            Take Me Home
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    )
}