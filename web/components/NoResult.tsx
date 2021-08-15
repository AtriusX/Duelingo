import { HTMLProps } from "react";
import styles from "../styles/NoResult.module.css"

interface NoResultProps extends HTMLProps<HTMLDivElement> {
    message?: string
    emoji?: string
}

export default function NoResult({ message, emoji, children, className, ...props }: NoResultProps) {
    const style = [className, styles.empty].join(" ")
    return (
        <div {...props} className={style}>
            <div className={styles.emptyemblem}>
                <h2>{message}</h2>
                <p>{emoji}</p>
                {children}
            </div>
        </div>
    )
}