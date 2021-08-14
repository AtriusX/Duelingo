import styles from "../styles/500.module.css"
import Title from "../components/Title"

export default function ErrorPage() {
    return (
        <div className={styles.body}>
            <Title title="Error | Internal Exception" />
            <div className={styles.container}>
                <h1>We{"'"}re currently experiencing some server issues. Please check back later!</h1>
            </div>
        </div>
    )
}