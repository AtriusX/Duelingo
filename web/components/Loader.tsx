import router from "next/router"
import { HTMLProps, useEffect, useState } from "react"
import ReactVisibilitySensor from "react-visibility-sensor"
import styles from "../styles/Loader.module.css"

interface LoaderProps extends HTMLProps<HTMLDivElement> {
    hide?: boolean
    run?: (visible: boolean, hide: () => void) => void
}

export default function Loader({ hide, run, className, ...others }: LoaderProps) {
    const [hidden, setHidden] = useState(hide)
    const load = (v: boolean) => run && run(v, () => setHidden(true))
    const [init, setInit] = useState(false)
    useEffect(() => {
        if (init) return
        router.events.on("routeChangeComplete", () => {
            setHidden(false)
        })
        setInit(true)
    }, [init])
    return (
        !hidden ? <ReactVisibilitySensor resizeCheck onChange={load}>
            <div className={[styles.container, className].join(" ")} {...others}>
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