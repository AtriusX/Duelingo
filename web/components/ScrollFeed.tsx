import { ReactElement, useCallback, useEffect, useState } from "react"
import { useCounter } from "../utils"
import Loader from "./Loader"
import Pane, { PaneProps } from "./Pane"

interface ScrollFeedProps<T> extends PaneProps {
    text?: string
    action: (page: number) => Promise<T[] | null>
    map: (item: T, index: number) => ReactElement
    check?: () => boolean
}

export default function ScrollFeed<T>({ text, action, map, check, items: _, ...others }: ScrollFeedProps<T>) {
    const [items, setItems] = useState<T[]>()
    const [page, inc, , reset] = useCounter()
    const call = useCallback(async (visible: boolean = true, hide?: () => void) => {
        // TODO remove this artificial delay later
        setTimeout(async () => {
            if (!visible) return
            let res = await action(page) ?? []
            if (!res.length) {
                if (!items) setItems([])
                return hide && hide()
            }
            setItems([...items ?? [], ...res])
            inc()
            if ((res?.length ?? 0) < 50 && hide)
                hide()
        }, 2000)
    }, [action, inc, items, page])

    useEffect(() => {
        if (!check || check()) return
        reset()
        setItems(undefined)
        call()
    }, [call, reset, items, text, check, action, page])

    return (
        <Pane {...others} items={items ?? [undefined]}>
            {text && <h2>{text}</h2>}
            {items?.map((item, index) => map(item, index))}
            <Loader action={call} />
        </Pane>
    )
}