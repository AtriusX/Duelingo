import styles from "../styles/Leaderboard.module.css"

interface LeaderboardProps {

}

export default function Leaderboard({ }: LeaderboardProps) {
    return (
        <div className={styles.container}>
            <h1>Leaderboard</h1>
            <ol>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
                <li>Test</li>
            </ol>
        </div>
    )
}