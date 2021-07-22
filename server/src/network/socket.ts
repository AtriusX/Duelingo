import { SessionData } from 'express-session';
import { Handshake, cast } from '../types';
import { ConnectionRepository } from './ConnectionRepository';
import { SocketConfig } from './../config/cors';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import sharedsession from 'express-socket.io-session';
import { RequestHandler } from 'express';
import chalk from 'chalk';

export function setupSockets(http: HttpServer, sess: RequestHandler) {
    const io = new Server(http, SocketConfig)
    let repo = ConnectionRepository.init(io)
  
    io.use(sharedsession(sess, {
      autoSave: true
    }))
  
    io.on("connection", socket => {
        const session = (token: string, func: (err: any, sess: SessionData) => void) =>
            cast<Handshake>(socket.handshake).sessionStore.get(token, func)
        // Handshake
        socket.on("handshake", token => session(token, (_, s) => {
            repo.insert(s.userId, socket)
        }))
    })
    test()
}

async function test() {
  let count = 0
  setInterval(() => {
    console.log(chalk.redBright("Broadcasting to clients!"));
    ConnectionRepository.get().forEach(socket => {        
        socket?.emit("test", `Test ${count}`)
    })
    count++
  }, 3000)
}