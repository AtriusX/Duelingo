import { NamedRivalry } from "../api";
import { colorHash } from "./Avatar";
import styles from "../styles/CasualSelection.module.css"

interface CasualSelectionProps {
    rival: NamedRivalry
}

export default function CasualSelection({ rival }: CasualSelectionProps) {
    return (
        <div className={styles.item}>
            {rival.username}
        </div>
    )
}

