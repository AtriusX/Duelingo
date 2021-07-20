import { MouseEventHandler, MouseEvent, useEffect, useState } from "react";
import { Rivalry, Setter, Option } from "../api";
import { create, remove } from "../api/rival";
import { User } from "../api/";
import { cast } from "../utils";
import styles from "../styles/RivalButton.module.css"

interface RivalProps {
    self?: User
    user?: User
    state?: Rivalry
}

export default function RivalButton({ self, user, state }: RivalProps) {
    const [status, setStatus] = useState<Option<Rivalry>>(state ?? null)
    // We do this to force update the value when the page changes
    useEffect(() => {
        setStatus(state ?? null)
    }, [state])
    const Add = ({ value }: any) =>
        <Button value={value} exec={e => add(e, user?.id, setStatus)} />
    const Rem = ({ value }: any) =>
        <Button value={value} exec={e => rem(e, user?.id, setStatus)} />
    // Dont show the button if the user is logged out or the same id
    if (!self || self?.id === user?.id)
        return null

    // This is a bit messy, but it's at least a bit more readable than just 
    // trying to handle it 100% dynamically 
    if (!!status) {
        // If the status isn't active and the sender is the profile
        if (!status.active && status.sender === user?.id) return (
            <>
                <Add value="Accept Rivalry" />
                <Rem value="Reject Rivalry" />
            </>
        )
        // If the status isn't active and the receiver is the profile
        if (!status.active && status.receiver === user?.id) return (
            <Rem value="Cancel Request" />
        )
        // If the status is active
        if (status.active) return (
            <Rem value="Remove Rival" />
        )
    }
    // No rivalry status exists currently
    return (
        <Add value="Add Rival" />
    )
}

type ButtonProps = {
    value: string
    exec: MouseEventHandler<HTMLButtonElement>
}

function Button({ value, exec }: ButtonProps) {
    return (
        <button className={styles.button} onClick={exec}>{value}</button>
    )
}

async function add(e: MouseEvent, receiver?: number, setStatus?: Setter<Rivalry>) {
    e.preventDefault()
    const res = receiver ? await create(receiver) : null
    if (status !== null && setStatus)
        setStatus(cast<Rivalry>(res))
}

async function rem(e: MouseEvent, receiver?: number, setStatus?: Setter<Option<Rivalry>>) {
    e.preventDefault()
    const res = receiver ? await remove(receiver) : {}
    if (res === null && setStatus)
        setStatus(null)
}