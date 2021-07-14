import { HTMLProps, ReactElement } from "react"
import styles from "../styles/Paginator.module.css"

interface PaginatorProps extends HTMLProps<HTMLDivElement> {
    page: number
    pageCount: number
    buttonCount: number
    click: (page: number) => void
}

export default function Paginator({ page, pageCount, buttonCount, click, ...props }: PaginatorProps) {
    let elements: ReactElement[] = []
    let pad = buttonCount / 2
    let start = Math.floor(
        Math.max(pad,
            Math.min(page, pageCount - pad)
        ) - pad
    )
    for (let i = 1; i <= Math.min(buttonCount, pageCount); i++) {
        let p = start + i
        elements.push(
            <button key={i} className={p == page ? styles.active : undefined} onClick={() => click(p)}>{p}</button>
        )
    }
    return (
        <div className={styles.paginator}>
            <div {...props}>
                <button onClick={() => click(1)}>{"<"}</button>
                {elements}
                <button onClick={() => click(pageCount)}>{">"}</button>
            </div>
        </div>
    )
}