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
import { getOpponent, getGameState, Player, PublicQuestion } from "../../api/game";
import styles from "../../styles/Game.module.css"
import { HTMLProps } from "react";
import router from "next/router";
import { Socket } from "socket.io-client";
import ReactModal from "react-modal";
import { usePartialState } from "../../utils";

interface GameProps {
    gameId: string
    user: User & Token
    opponent: User,
    state: [Player, Player, boolean, [number, number?], PublicQuestion?]
}

type ResultState = { visible: boolean, error?: string }

export default function Game({
    gameId, user, opponent,
    state: [a, b, started, times, question]
}: GameProps) {
    const [{ score, streak }, setPlayer] = usePartialState(a.id === user.id ? a : b)
    const [{
        score: opponentScore,
        streak: opponentStreak
    },
        setOpponent
    ] = usePartialState(a.id === user.id ? b : a)
    const [[time, questionTime], setTimes] = useState(times)
    const [start, setStart] = useState(started)
    const [correct, setCorrect] = useState<[number, boolean]>()
    const [showResults, setShowResults] = useState<ResultState>({ visible: false })
    const [q, setQuestion] = useState<PublicQuestion | undefined>(question)
    useEffect(() => {
        if (time <= 0)
            setShowResults({ visible: true })
    }, [time])
    const socket = useSocket(socket => {
        socket.on("game-dropped", () => {
            // alert("It looks like your opponent left the game... Press OK to return to the menu.")
            setShowResults({ visible: true, error: "Your opponent left the game..." })
            // router.push("/")
        })
        socket.on("update-timer", (t, q) => {
            setTimes([t, q])
            setStart(true)
        })
        socket.on("update-score", (score, streak, id) => {
            if (id === user.id)
                setPlayer({ score, streak })
            if (id === opponent.id)
                setOpponent({ score, streak })
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
                <PlayerInfo user={user} score={score} streak={streak}
                    className={[styles.player, styles.info].join(" ")} />
                <div className={styles.timer}>
                    {start && <>
                        <h2>{`${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, "0")}`}</h2>
                        <h1>|</h1>
                        <h2>{questionTime}</h2>
                    </>}
                </div>
                <PlayerInfo user={opponent} score={opponentScore} streak={opponentStreak}
                    className={[styles.opponent, styles.info].join(" ")} />
            </div>
            <div className={styles.game}>
                {!start
                    ? <div className={styles.timer}>
                        <Countdown pretext="Starting in" duration={time} />
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
    streak: number
}

function PlayerInfo({ user, score, streak, ...props }: PlayerInfoProps) {
    return (
        <div {...props}>
            <Avatar className={styles.avatar} user={user} />
            <div className={styles.userdata}>
                <h2>{user.username}</h2>
                <div className={styles.scoreinfo}>
                    <p><b>Score: {score}</b></p>
                    {!!streak && <b>Streak: {streak}</b>}
                </div>
            </div>
        </div>
    )
}

interface ResultProps {
    show: ResultState
    scores: [number, number]
}

function Result({ show: { visible, error }, scores }: ResultProps) {
    return (
        <ReactModal
            isOpen={visible}
            ariaHideApp={false}
            className={styles.results}
            style={{
                overlay: {
                    background: "var(--modalback)"
                }
            }}
        >
            {!error && <h1>{scores[0] === scores[1] ? "Draw"
                : `You ${scores[0] > scores[1] ? "won" : "lost"}!`}</h1>}
            {error && <h3>{error}</h3>}
            {!error && <h2>Your score: {scores[0]}</h2>}
            <button onClick={() =>
                router.push("/", undefined, {
                    shallow: true
                })
            }>Leave Game</button>
        </ReactModal>
    )
}

interface GamePanelProps {
    gameId: string
    socket: Socket
    token: Token
    question?: PublicQuestion
    correct?: [number, boolean]
}

function GamePanel({ gameId, socket, token, question, correct }: GamePanelProps) {
    return (
        <SocketProvider socket={socket} className={styles.panel}>
            <h1>Translate the phrase</h1>
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
    const state = await getGameState(gameId) ?? [undefined, undefined, false, [0]]
    return { props: { gameId, user, opponent, state } }
}