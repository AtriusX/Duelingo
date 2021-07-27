// import { User } from './../entities/User';
import { MikroORM } from '@mikro-orm/core';
import { SessionData } from 'express-session';
import { Handshake, cast } from '../types';
import { SocketConfig } from '../config/cors';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import sharedsession from 'express-socket.io-session';
import { RequestHandler } from 'express';
import ConnectionRepository from './ConnectionRepository';
import { availableRivals } from '../api/rival';
import chalk from 'chalk';
import ChallengeManager from './ChallengeManager';

export function setupSockets({ em }: MikroORM ,http: HttpServer, sess: RequestHandler) {
    const io = new Server(http, SocketConfig)
    let repo = ConnectionRepository.init(io, 3)
    let challenges = ChallengeManager.get()
  
    io.use(sharedsession(sess, {
      autoSave: true
    }))
  
    io.on("connection", socket => {
        const session = (token: string, func: (err: any, sess: SessionData) => void) =>
            cast<Handshake>(socket.handshake).sessionStore.get(token, func)
        // Handshake
        socket.on("handshake", token => session(token, (_, session) => {
          repo.insert(session.userId, socket)
        }))

        socket.on("query-rivals", (token, value) => session(token, async (_, session) => {
          console.log(chalk.cyanBright("Getting rivals for", session?.userId));
          socket.emit("get-rivals", (await availableRivals(em, session?.userId))
            .filter(r => r.username.toLowerCase().includes(value.toLowerCase())))
        }))

        socket.on("challenge-rival", (token, id) => session(token, async (_, session) => {
          console.log(session?.userId, "sent a challenge to", id);
          let active = await repo.recall(id)
          console.log(!!active ? "User is active" : "User is not active")
          if (!!active) console.log(challenges.challenge(session?.userId, id, () => {
            active?.socket?.emit("get-challenges", "You recieved a challenge! Check the home page to view it!")              
          }))
        }))
    })
}
