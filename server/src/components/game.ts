import ChallengeManager from '../network/ChallengeManager';
import { MikroORM } from "@mikro-orm/core"
import { Express, Request, Response } from "express"
import ConnectionRepository from '../network/ConnectionRepository';
import { getChallenges } from '../api/user';
import GameTracker from '../network/GameTracker';

export default function setupGame(app: Express, { em }: MikroORM) {

    let challenges = ChallengeManager.get()
    let repo = ConnectionRepository.get()

    app.post("/game/accept", async (req: Request, res: Response) => {
        let data = challenges.accept(req.session.userId ?? 0, req.body.id)
        console.log(data);
        if (typeof data === "string") {
            res.status(200).json({ id: data })
        }
        else
            res.status(200).json(data)
    })

    app.post("/game/reject", async (req: Request, res: Response) => {
        let data = challenges.reject(req.session.userId ?? 0, req.body.id)
        console.log(data);
        
        if (data === true)
        {
            (await repo.recall(req.body.id))?.socket?.emit("challenge-rejected", "Your game was rejected.")
            res.status(200)
        }
        else 
            res.status(200).json(data)
    })

    app.post("/challenge/cancel", async (req: Request, res: Response) => {
        let data = challenges.cancel(req.session.userId ?? 0, req.body.id)
        console.log(data);
        if (data === true) {
            res.status(200)
        }
        else
            res.status(200).json(data)
    })

    app.post("/challengers", async (req: Request, res: Response) => {
        let data = await getChallenges(em, req.session.userId ?? 0)
        console.log(data);
        
        res.status(200).json(data)
    })

    app.post("/game/opponent", async (req: Request, res: Response) => {
        let self = req.body.self
        let gameId: string = req.body.gameId
        
        if (!gameId || !self) {
            res.status(404)
            return
        }
        let opponent = await GameTracker.get().getOpponent(gameId, self)        
        res.status(200).json(opponent)
    })

    app.post("/game/state", async (req: Request, res: Response) => {
        let gameId: string = req.body.gameId
        let game = GameTracker.get().getGame(gameId)
        if (!game) {
            res.status(404)
            return
        }
        res.status(200).json(game.getState())
    })
}
