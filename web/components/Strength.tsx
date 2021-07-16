import styles from "../styles/Strength.module.css"

interface StrengthProps {
    input: string,
    colors: string[]
    maxScore?: number
}

export default function Strength({ input, colors, maxScore }: StrengthProps) {
    let expected = calculateStrength(input)
    let chars = (maxScore ?? 12) / colors.length
    let width = 100 / colors.length
    let pos = Math.ceil(expected / chars)

    return <div className={styles.strength}>
        <div style={{
            width: `${width * pos}%`,
            background: colors[Math.min(pos - 1, colors.length - 1)]
        }}></div>
    </div>
}

// Very simple password strength calculation
function calculateStrength(input: string) {
    let score = 0
    if (!!input.match(/\d/)) // Matches digits
        score += 2
    if (!!input.match(/[A-Z]/)) // Matches uppercase
        score += 2
    if (!!input.match(/[^\w\d]/)) // Matches specials
        score += 3
    console.log(score);

    return input.length + score
}