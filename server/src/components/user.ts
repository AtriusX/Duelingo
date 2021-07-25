// import ConnectionRepository from '../network/ConnectionRepository';
import { sessionId } from './../api/index';
import { verify } from 'argon2';
import { Express, Request, Response } from 'express'
import { MikroORM } from '@mikro-orm/core';
import { User } from '../entities/User';
import { getUpdates, search, updateUser } from '../api/user'
import { deleteUser } from '../api/auth';

export default function setupUser(app: Express, db: MikroORM) {
    
    app.get("/user/me", async (req, res) => {
        const sess = req.session    
        const user = await db.em.findOne(User, { id: sess.userId })        
        res.status(200).json(!!user ? { ...user, token: sess.id } : null)
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
        const userId = sessionId(req.session)
        const body: any = req.body
        const user = await db.em.findOne(User, { id: userId })                
        if (!!body.password?.length && user && !(await verify(user.password, body.existing)))
            return res.status(200).json({ message: "Existing password does not match current password!" })
        const update = await updateUser(db.em, body, userId)
        return res.status(200).json(update)
    })

    app.get("/updates", async (req: Request, res: Response) => {
        const userId = sessionId(req.session)
        res.status(200).json(await getUpdates(db.em, userId))
    })

    app.post("/forget", async (req: Request, _: Response) => {
        const id = req.session?.userId
        console.log("FORGET", id);
        // if (!!id)
        //     ConnectionRepository.get().drop(id)    
        // return res.status(200)
    })
}