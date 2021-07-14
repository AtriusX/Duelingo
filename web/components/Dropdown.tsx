import router from "next/router"
import { ChangeEvent, HTMLProps } from "react"

type PText = HTMLParagraphElement & { props: any }
type DropdownProps = HTMLProps<HTMLSelectElement> & {
    name: string
    pos?: number,
    trail?: string
}

export default function Dropdown({ children, name, pos, trail, ...props }: DropdownProps) {
    const values = (children as PText[])
        .map(e => e.props.children)
    return (
        <select {...props} onChange={e => change(e, name)}>
            {(values).map((e, i) =>
                <option key={i} value={e}>
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