import { NamedRivalry } from "../api";
import { colorHash } from "./Avatar";
import styles from "../styles/CasualSelection.module.css"
import { Socket } from "socket.io-client";
import { Token } from "../api/user";

interface CasualSelectionProps {
    rival: NamedRivalry
    token: Token
    socket: Socket
    select: (user: NamedRivalry) => void
}

export default function CasualSelection({ rival, token, socket, select }: CasualSelectionProps) {
    return (
        <div className={styles.item}>
            {rival.username}
            <button onClick={() => {
                socket.emit("challenge-rival", token.token, rival.id)
                select(rival)
            }}>
                Challenge
            </button>
        </div>
    )
}

