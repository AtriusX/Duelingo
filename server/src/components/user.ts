import { verify } from 'argon2';
import { Express, Request, Response } from 'express'
import { MikroORM } from '@mikro-orm/core';
import { User } from '../entities/User';
import { search, updateUser } from '../api/user'
import { deleteUser } from '../api/auth';

export default function setupUser(app: Express, db: MikroORM) {
    
    app.get("/user/me", async (req, res) => {
        const sess: any = req.session
        const user = await db.em.findOne(User, { id: sess.userId })        
        res.status(200).json(user)
    })

    app.delete("/user/me", async (req, res) => {
        const sess: any = req.session
        const { password } = req.body
        const result = await deleteUser(db.em, sess.userId, password)
        if (result == true)
            req.session.destroy(() => {})
        res.status(200).json(result)
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
        const users = await search(db.em, req.query)
        res.status(200).json(users)
    })

    app.post("/update", async (req: Request, res: Response) => {
        const sess: any = req.session
        const body: any = req.body
        const user = await db.em.findOne(User, { id: sess.userId })                
        if (!!body.password?.length && user && !(await verify(user.password, body.existing)))
                return res.status(200).json({ message: "Existing password does not match current password!" })
        const update = await updateUser(db.em, body, sess)
        return res.status(200).json(update)
    })
}