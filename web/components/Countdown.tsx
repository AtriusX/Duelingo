import { HTMLProps, useEffect, useState } from "react";

interface CountdownProps extends HTMLProps<HTMLDivElement> {
    duration: number,
    end?: () => void
}

export default function Countdown({ duration, end, ...props }: CountdownProps) {
    // let start = date instanceof Date ? date.getTime() : date
    // let end = start + duration
    const [secondsRemaining, setSecondsRemaining] = useState(duration)
    useEffect(() => {
        const id = setInterval(() => {
            setSecondsRemaining(secondsRemaining - 1)
        }, 1000)
        if (secondsRemaining <= 0) {
            clearInterval(id)
            if (end) end()
        }
        return () => clearInterval(id)
    }, [secondsRemaining, end])
    return (
        <div {...props}>
            <h1>{secondsRemaining}</h1>
        </div>
    )
}