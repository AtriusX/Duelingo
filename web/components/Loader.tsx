import router from "next/router"
import { useEffect, useState } from "react"
import ReactVisibilitySensor from "react-visibility-sensor"
import styles from "../styles/Loader.module.css"

interface LoaderProps {
    hide?: boolean
    action?: (visible: boolean, hide: () => void) => void
}

export default function Loader({ hide, action }: LoaderProps) {
    const [hidden, setHidden] = useState(hide)
    const run = (v: boolean) => action && action(v, () => setHidden(true))
    const [init, setInit] = useState(false)
    useEffect(() => {
        if (init) return
        router.events.on("routeChangeComplete", () => {
            setHidden(false)
        })
        setInit(true)
    }, [init])
    return (
        !hidden ? <ReactVisibilitySensor resizeCheck onChange={run}>
            <div className={styles.container}>
                <div>
                    <div className={[styles.block, styles.a].join(" ")} />
                    <div className={[styles.block, styles.b].join(" ")} />
                </div>
                <div>
                    <div className={[styles.block, styles.c].join(" ")} />
                    <div className={[styles.block, styles.d].join(" ")} />
                </div>
            </div>
        </ReactVisibilitySensor> : null
    )
}