import { HTMLProps } from "react";
import { cast } from "../utils";
import NoResult from "./NoResult";
import styles from "../styles/Pane.module.css"
export interface PaneProps extends HTMLProps<HTMLDivElement> {
    emptyIcon?: string
    emptyText: string
    items?: any[] | number
}

export default function Pane({ emptyIcon, emptyText, items, children, className, ...props }: PaneProps) {
    let classes = [className, styles.container].join(" ")
    return (
        <div className={classes} {...props}>
            {(typeof items === "number" && !!items)
                || (!!cast<any>(items)?.length ?? 0)
                ? children
                : <NoResult className={styles.noresult} message={emptyText} emoji={emptyIcon} />}
        </div>
    )
}

export function PaneFiller() {
    return (
        <div>

        </div>
    )
}