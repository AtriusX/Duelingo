import { NextPageContext } from "next";
import { User } from "../../api";

interface CasualProps {
    self: User
}

export default function Casual({ }: CasualProps) {
    return (
        <div></div>
    )
}

export async function getServerSideProps({ req, query }: NextPageContext) {

    return { props: {} }
}