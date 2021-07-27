import ChallengeManager from '../network/ChallengeManager';
import { MikroORM } from "@mikro-orm/core"
import { Express, Request, Response } from "express"
import ConnectionRepository from '../network/ConnectionRepository';
import { v4 } from "uuid"

export default function setupGame(app: Express, {  }: MikroORM) {

    let challenges = ChallengeManager.get()
    let repo = ConnectionRepository.get()

    app.post("/game/accept", async (req: Request, res: Response) => {
        let data = challenges.accept(req.session.userId ?? 0, req.body.id)
        console.log(data);
        let id = v4()
        if (data === true) {
            (await repo.recall(req.body.id))?.socket?.emit("challenge-accepted", id)
            res.status(200).json({ id })
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
}
