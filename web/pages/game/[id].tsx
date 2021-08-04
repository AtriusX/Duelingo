import { NextPageContext } from "next";
import { useEffect, useState } from "react";
import { User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self, Token } from "../../api/user";
import Title from "../../components/Title";
import { defaultSocket } from "../../utils";
import Avatar from "../../components/Avatar"
import SocketProvider from "../../components/SocketProvider"
import Countdown from "../../components/Countdown"
import { getOpponent, getGameState } from "../../api/game";
import styles from "../../styles/Game.module.css"
import { HTMLProps } from "react";
import router from "next/router";
import { Socket } from "socket.io-client";
import ReactModal from "react-modal";

interface GameProps {
    gameId: string
    user: User & Token
    opponent: User,
    state: [number, number, boolean, number]
}

export default function Game({
    gameId, user, opponent,
    state: [a, b, started, time]
}: GameProps) {
    const [score, setScore] = useState(a)
    const [opponentScore, setOpponentScore] = useState(b)
    const [timer, setTimer] = useState(time)
    const [start, setStart] = useState(started)
    const [showResults, setShowResults] = useState(false)
    const socket = defaultSocket(socket => {
        socket.on("game-dropped", () => {
            alert("It looks like your opponent left the game... Press OK to return to the menu.")
            router.push("/")
        })
        socket.on("update-timer", v => {
            setTimer(v)
            setStart(true)
        })
        socket.on("update-score", (value, id) => {
            if (id !== user.id)
                setOpponentScore(value)
            else
                setScore(value)
        })
    }, "game", user.token)
    return (
        <SocketProvider className={styles.container} socket={socket}>
            <Title title={`${user.username} vs. ${opponent.username}`} />
            <div className={styles.header}>
                <PlayerInfo user={user} score={score}
                    className={[styles.player, styles.info].join(" ")} />
                <div className={styles.timer}>
                    {start && <Countdown duration={timer} end={() => setShowResults(true)} />}
                </div>
                <PlayerInfo user={opponent} score={opponentScore}
                    className={[styles.opponent, styles.info].join(" ")} />
            </div>
            <div className={styles.game}>
                {!start
                    ? <div className={styles.timer}>
                        <h1>Starting in</h1>
                        <Countdown duration={timer} />
                    </div>
                    : <GamePanel gameId={gameId} socket={socket} token={user} />}
            </div>
            <Result show={showResults} score={score} />
        </SocketProvider>
    )
}

interface PlayerInfoProps extends HTMLProps<HTMLDivElement> {
    user: User,
    score: number
}

function PlayerInfo({ user, score, ...props }: PlayerInfoProps) {
    return (
        <div {...props}>
            <Avatar className={styles.avatar} user={user} />
            <div className={styles.userdata}>
                <h2>{user.username}</h2>
                <p>{score}</p>
            </div>
        </div>
    )
}

interface ResultProps {
    show: boolean
    score: number
}

function Result({ show, score }: ResultProps) {
    return (
        <ReactModal
            isOpen={show}
            ariaHideApp={false}
            className={styles.results}
            style={{
                overlay: {
                    background: "var(--modalback)"
                }
            }}
        >
            <h1>Your score: {score}</h1>
            <button onClick={() => {
                router.push("/", undefined, {
                    shallow: true
                })
            }}>
                Leave Game
            </button>
        </ReactModal>
    )
}

interface GamePanelProps {
    gameId: string
    socket: Socket
    token: Token
}

function GamePanel({ gameId, socket, token }: GamePanelProps) {
    const [question, setQuestion] =
        useState<Omit<QuestionProps, "socket" | "token" | "gameId"> | null>()
    useEffect(() => setQuestion({
        question: "Example",
        choices: ["A", "B", "C", "D"]
    }), [setQuestion])
    function load(socket: Socket, token?: string) {

    }
    return (
        <SocketProvider socket={socket} load={load} token={token.token}>
            {question && <Question {...question} gameId={gameId}
                socket={socket} token={token.token} />}
        </SocketProvider>
    )
}

interface QuestionProps {
    question: string
    choices: string[]
    gameId: string
    socket: Socket
    token: string
}

function Question({ question, choices, ...others }: QuestionProps) {
    return (
        <div className={styles.question}>
            <h1>{question}</h1>
            <div className={styles.questioncontainer}>
                {choices.map((c, i) => <Choice key={i} pos={i} choice={c} {...others} />)}
            </div>
        </div>
    )
}

interface ChoiceProps {
    gameId: string
    choice: string
    pos: number
    socket: Socket
    token: string
    correct?: boolean
}

function Choice({ gameId, choice, pos, socket, token, correct }: ChoiceProps) {
    return (
        <div
            className={styles.choice}
            onClick={() => socket.emit("answer-question", token, pos, gameId)}
            style={{
                borderColor: !!correct ? "var(--primary)" : "var(--error)"
            }}>
            {choice}
        </div>
    )
}

export async function getServerSideProps({ req, query }: NextPageContext) {
    const user = await self(req?.headers.cookie)
    if (!user)
        return homeRedirect
    const gameId = query["id"] as string
    const opponent = await getOpponent(user.id, gameId)
    if (!opponent)
        return homeRedirect
    const state = await getGameState(gameId) ?? [-1, -1, false, -1]
    return { props: { gameId, user, opponent, state } }
}