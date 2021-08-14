import { ReactElement, useCallback, useEffect, useState } from "react"
import { useCounter } from "../utils"
import Loader from "./Loader"
import Pane, { PaneProps } from "./Pane"

interface ScrollFeedProps<T> extends PaneProps {
    text?: string
    run: (page: number) => Promise<T[] | null>
    map: (item: T, index: number) => ReactElement
    check?: () => boolean
}

export default function ScrollFeed<T>({ text, run, map, check, items: _, ...others }: ScrollFeedProps<T>) {
    const [items, setItems] = useState<T[]>()
    const [page, inc, , reset] = useCounter()
    const call = useCallback(async (visible: boolean = true, hide?: () => void) => {
        if (!visible) return
        let res = await run(page) ?? []
        if (!res.length) {
            if (!items) setItems([])
            return hide && hide()
        }
        setItems([...items ?? [], ...res])
        inc()
        if ((res?.length ?? 0) < 50 && hide)
            hide()
    }, [inc, items, page, run])

    useEffect(() => {
        if (!check || check()) return
        reset()
        setItems(undefined)
        call()
    }, [call, reset, items, text, check, page])

    return (
        <Pane {...others} items={items ?? [undefined]}>
            {text && <h2>{text}</h2>}
            {items?.map((item, index) => map(item, index))}
            <Loader run={call} />
        </Pane>
    )
}