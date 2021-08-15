import { HTMLProps, useEffect, useState } from "react";

interface CountdownProps extends HTMLProps<HTMLDivElement> {
    pretext?: string
    duration: number,
    end?: () => void
}

export default function Countdown({ pretext, duration, end, ...props }: CountdownProps) {
    const [secondsRemaining, setSecondsRemaining] = useState(duration)
    useEffect(() => setSecondsRemaining(duration), [duration, setSecondsRemaining])

    useEffect(() => {
        const id = setInterval(() => {
            setSecondsRemaining(secondsRemaining - 1)
        }, 1000)
        if (secondsRemaining < 1) {
            clearInterval(id)
            if (end) end()
        }
        return () => clearInterval(id)
    }, [secondsRemaining, end])
    return (
        <div {...props}>
            <h1>{pretext} {secondsRemaining}</h1>
        </div>
    )
}