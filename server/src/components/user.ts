import { Express, Request, Response } from 'express'
import { MikroORM } from '@mikro-orm/core';
import { User } from '../entities/User';
import { search, updateUser } from '../api/user'

export default function setupUser(app: Express, db: MikroORM) {
    
    app.get("/user/me", async (req, res) => {
        const sess: any = req.session
        const user = await db.em.findOne(User, { id: sess.userId })        
        res.status(200).json(user)
    })

    app.get("/user/:id", async (req: Request, res: Response) => {
        const user = await db.em.findOne(User, { id: parseInt(req.params.id) || 0 })        
        if (!user)
            return res.status(404).json({ error: "No user found!" })
        const { password: _, ...out } = user
        res.status(200).json(out)
        return
    })
    
    app.get("/search", async (req: Request, res: Response) => {
        const query = req.query.query
        const users = await search(db.em, query as string)
        res.status(200).json(users)
    })

    app.post("/update", async (req: Request, res: Response) => {
        const sess: any = req.session
        const update = await updateUser(db.em, req.body, sess)
        res.status(200).json({ success: update })
    })
}