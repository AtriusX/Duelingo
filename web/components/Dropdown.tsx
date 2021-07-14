import router from "next/router"
import { ChangeEvent, HTMLProps } from "react"

type PText = HTMLParagraphElement & { props: any }
type DropdownProps = HTMLProps<HTMLSelectElement> & {
    name: string
    pos?: number,
    trail?: string,
    useIndex?: boolean
    reverseIndex?: boolean
}

export default function Dropdown({ children, name, pos, trail, useIndex, reverseIndex, ...props }: DropdownProps) {
    const values = (children as PText[])
        .map(e => e.props.children)
    return (
        <select {...props} onChange={e => change(e, name)}>
            {(values).map((e, i) =>
                <option key={i} value={useIndex ? (reverseIndex ? values.length - i : i + 1) : e}>
                    {e} {i !== 0 ? trail : undefined}
                </option>
            )}
        </select>
    )
}

function change(e: ChangeEvent<HTMLSelectElement>, name: string) {
    const query = router.query
    query[name] = (e.target as HTMLSelectElement).value
    router.push({
        query
    })
}