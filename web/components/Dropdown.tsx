import { HTMLProps } from "react"

type PText = HTMLParagraphElement & { props: any }
type DropdownProps = HTMLProps<HTMLSelectElement> & { pos?: number, trail?: string }

export default function Dropdown({ children, pos, trail, ...props }: DropdownProps) {
    const values = (children as PText[])
        .map(e => e.props.children)
    return (
        <select {...props} defaultValue={pos ? values[pos] : undefined}>
            {(values).map((e, i) =>
                <option key={i} value={e}>
                    {e} {i !== 0 ? trail : undefined}
                </option>
            )}
        </select>
    )
}