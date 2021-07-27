import { NextPageContext } from "next";
import Title from "../../components/Title";

export default function Game() {
    return (
        <div>
            <Title title="Game Page" />
            Game Page!
        </div>
    )
}

export async function getServerSideProps({ }: NextPageContext) {
    return { props: {} }
}