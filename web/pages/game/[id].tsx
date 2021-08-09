import { NextPageContext } from "next";
import { useEffect, useState } from "react";
import { User } from "../../api";
import { homeRedirect } from "../../api/auth";
import { self, Token } from "../../api/user";
import Title from "../../components/Title";
import { useSocket } from "../../components/SocketProvider";
import Avatar from "../../components/Avatar"
import SocketProvider from "../../components/SocketProvider"
import Countdown from "../../components/Countdown"
import { getOpponent, getGameState, Player } from "../../api/game";
import styles from "../../styles/Game.module.css"
import { HTMLProps } from "react";
import router from "next/router";
import { Socket } from "socket.io-client";
import ReactModal from "react-modal";

type Question = {
    question: string,
    choices: string[]
}

interface GameProps {
    gameId: string
    user: User & Token
    opponent: User,
    state: [Player, Player, boolean, number, Question | undefined]
}

export default function Game({
    gameId, user, opponent,
    state: [a, b, started, time, question]
}: GameProps) {
    const [score, setScore] = useState(a.id === user.id ? a.score : b.score)
    const [opponentScore, setOpponentScore] = useState(a.id === user.id ? b.score : a.score)
    const [timer, setTimer] = useState(time)
    const [start, setStart] = useState(started)
    const [correct, setCorrect] = useState<[number, boolean]>()
    const [showResults, setShowResults] = useState(false)
    const [q, setQuestion] =
        useState<Question | undefined>(question ?? undefined)
    useEffect(() => {
        if (timer <= 0)
            setShowResults(true)
    }, [timer])
    const socket = useSocket(socket => {
        socket.on("game-dropped", () => {
            alert("It looks like your opponent left the game... Press OK to return to the menu.")
            router.push("/")
        })
        socket.on("update-timer", v => {
            setTimer(v)
            setStart(true)
        })
        socket.on("update-score", (value, id) => {
            if (id === user.id) {
                setScore(value)
            }
            if (id === opponent.id) {
                setOpponentScore(value)
            }
        })
        socket.on("question-result", (choice, correct) => setCorrect([choice, correct]))
        socket.on("question", v => {
            setQuestion(v)
            setCorrect(undefined)
        })
    }, {
        position: "game",
        token: user
    })
    return (
        <SocketProvider className={styles.container} socket={socket}>
            <Title title={`vs. ${opponent.username}`} />
            <div className={styles.header}>
                <PlayerInfo user={user} score={score}
                    className={[styles.player, styles.info].join(" ")} />
                <div className={styles.timer}>
                    {start && <h1>{timer}</h1>}
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
                    : <GamePanel gameId={gameId} socket={socket} token={user} question={q} correct={correct} />}
            </div>
            <Result show={showResults} scores={[score, opponentScore]} />
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
    scores: [number, number]
}

function Result({ show, scores }: ResultProps) {
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
            <h1>You {scores[0] === scores[1] ? "Draw"
                : scores[0] > scores[1] ? "won" : "lost"}!</h1>
            <h2>Your score: {scores[0]}</h2>
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
    question?: Question
    correct?: [number, boolean]
}

function GamePanel({ gameId, socket, token, question, correct }: GamePanelProps) {
    return (
        <SocketProvider socket={socket}>
            {question && <Question {...question} gameId={gameId}
                socket={socket} token={token.token} correct={correct} />}
        </SocketProvider>
    )
}

interface QuestionProps {
    question?: string
    choices?: string[]
    gameId: string
    socket: Socket
    token: string
    correct?: [number, boolean]
}

function Question({ question, choices, correct, ...others }: QuestionProps) {
    return (
        <div className={styles.question}>
            <h1>{question}</h1>
            <div className={styles.questioncontainer}>
                {choices?.map((c, i) => <Choice
                    correct={correct && correct[0] === i ? correct[1] : undefined}
                    key={i} pos={i} choice={c} {...others} active={correct === undefined} />)}
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
    active: boolean
}

function Choice({ gameId, choice, pos, socket, token, correct, active }: ChoiceProps) {
    return (
        <div
            className={styles.choice}
            onClick={() => active && socket.emit("answer-question", token, pos, gameId)}
            style={{
                borderColor: correct === true
                    ? "var(--primary)"
                    : correct === false
                        ? "var(--error)"
                        : undefined
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
    const state = await getGameState(gameId) ?? [undefined, undefined, false, 0, undefined]
    return { props: { gameId, user, opponent, state } }
}