import { em } from "./../index"
import { Socket } from "socket.io"
import GameTracker from "../network/GameTracker"
import { SessionData } from "express-session"
import { Handshake, cast } from "../types"
import { SocketConfig } from "../config/cors"
import { Server as HttpServer } from "http"
import { Server } from "socket.io"
import sharedsession from "express-socket.io-session"
import { RequestHandler } from "express"
import ConnectionRepository from "./ConnectionRepository"
import { availableRivals } from "../api/rival"
import ChallengeManager from "./ChallengeManager"
import { getChallenges } from "../api/user"
import MatchMaker from "./Matchmaker"
import { User } from "../entities/User"

type SessionFunction = (
  token: string,
  func: (err: any, sess: SessionData) => void
) => void

export function setupSockets(http: HttpServer, sess: RequestHandler) {
  const io = new Server(http, SocketConfig)
  let repo = ConnectionRepository.init(io, 3)
  let matchmaker = MatchMaker.get()

  io.use(
    sharedsession(sess, {
      autoSave: true,
    })
  )

  io.on("connection", (socket) => {
    const session: SessionFunction = (token, func) =>
      cast<Handshake>(socket.handshake).sessionStore.get(token, func)
    // Handshake
    socket.on("handshake", (token, position, timestamp) =>      
      session(token, async (_, session) => {
        repo.insert(session?.userId, socket, position, timestamp)
        if (session && session.userId) {
          let user = await em.findOne(User, session?.userId)
          if (position === "pool" && user) matchmaker.add(user)
          if (position !== "game" && user) GameTracker.get().drop(user.id)
        }
      })
    )
    setupChallenge(socket, session, repo)
    setupGame(socket, session)
  })
}

function setupChallenge(
  socket: Socket,
  session: SessionFunction,
  repo: ConnectionRepository
) {
  let challenges = ChallengeManager.get()

  socket.on("query-rivals", (token, value) =>
    session(token, async (_, session) => {
      socket.emit(
        "get-rivals",
        (await availableRivals(em, session?.userId)).filter((r) =>
          r.username.toLowerCase().includes(value.toLowerCase())
        )
      )
    })
  )

  socket.on("challenge-rival", (token, id) =>
    session(token, async (_, session) => {
      let active = await repo.recall(id)
      if (!!active)
        await challenges.challenge(session?.userId, id, async () => {
          active?.socket?.emit("get-challenges", await getChallenges(em, id))
        })
    })
  )

  socket.on("query-challenges", (token) =>
    session(token, async (_, session) => {
      socket.emit("get-challenges", await getChallenges(em, session?.userId))
    })
  )
}

function setupGame(socket: Socket, session: SessionFunction) {
  let games = GameTracker.get()

  socket.on("answer-question", (token, choice, gameId) => {
    session(token, async (_, session) => {
      let game = games.getGame(gameId)
      if (game?.has(session.userId)) {
        let correct = game.answer(session.userId, choice)
        socket.emit("question-result", choice, correct)
      }
    })
  })
}
