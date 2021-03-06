import { sessionId } from '../api/index';
import { MikroORM } from "@mikro-orm/core"
import { Express, Request } from "express"
import { Response } from "express-serve-static-core"
import { active, allRivals, availableRivals, create,  pending,  remove, status } from '../api/rival';

export default function setupRivals(app: Express, { em }: MikroORM) {

    app.post("/rival/create", async (req: Request, res: Response) => {
        const sender = sessionId(req.session)
        const data = await create(em, sender, req.body.receiver)
        res.status(200).json(data)
    })

    app.post("/rival/remove", async(req: Request, res: Response) => {
        const sender = sessionId(req.session)
        const data = await remove(em, sender, req.body.receiver)
        res.status(200).json(data)
    })

    app.get("/rivals/pending", async (req: Request, res: Response) => {
        const sender = sessionId(req.session)
        const data = await pending(em, sender)
        res.status(200).json(data)
    })

    app.get("/rivals/active", async (req: Request, res: Response) => {
        const sender = sessionId(req.session)
        const data = await active(em, sender)
        res.status(200).json(data)
    })


    app.get("/rivals/active/:id/:page", async (req: Request, res: Response) => {
        const sender = parseInt(req.params.id) || 0
        const page = parseInt(req.params.page) || 0
        const data = await active(em, sender, page)
        res.status(200).json(data)
    })

    app.get("/rivals/all", async (req: Request, res: Response) => {
        const sender = sessionId(req.session)
        const data = await allRivals(em, sender)
        res.status(200).json(data)
    })

    app.get("/rivals/all/:id/:page", async (req: Request, res: Response) => {
        const user = parseInt(req.params.id) || 0
        const page = parseInt(req.params.page) || 0
        const data = await allRivals(em, user, page)
        res.status(200).json(data)
    })

    app.get("/rival/:id", async (req: Request, res: Response) => {
        const sender = sessionId(req.session)
        const data = await status(em, sender, parseInt(req.params.id) || 0)
        res.status(200).json(data)
    })

    app.post("/rivals/available/:id", async (req: Request, res: Response) => {        
        const data = await availableRivals(em, parseInt(req.params["id"]) || 0)
        res.status(200).json(data)
    })
}
