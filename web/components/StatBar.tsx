import { useEffect, useState } from "react"
import VisibilitySensor from "react-visibility-sensor"
import styles from "../styles/StatBar.module.css"

interface StatBarProps {
    text: string
    value?: number | [number, number] | string
    color?: string
    display?: "ratio" | "percent" | "raw"
}

export default function StatBar({ text, value, display, color }: StatBarProps) {
    const [val, setVal] = useState<number | [number, number] | string>(0)
    useEffect(() => setVal(value ?? 0), [text, value])
    let disp = display ?? "percent"

    function getWidth(): number | string {
        if (disp === "percent" && typeof val === "number")
            return `${Math.round(Math.min(100, val))}%`
        if (disp === "ratio" && typeof val === "object")
            return `${Math.round(Math.min(100, (val[0] / val[1]) * 100))}%`
        return 0
    }
    return (
        <VisibilitySensor onChange={() => setVal(value ?? 0)}>
            <div>
                <div className={styles.stat}>
                    <h3>{text}</h3>
                    <h3>
                        {disp === "percent"
                            ? `${value}%`
                            : disp === "ratio" && typeof val === "object"
                                ? `${val[0]}/${val[1]}`
                                : value}
                    </h3>
                </div>
                <div className={styles.bar} style={{
                    background: color,
                    width: getWidth()
                }} />
            </div>
        </VisibilitySensor>
    )
}