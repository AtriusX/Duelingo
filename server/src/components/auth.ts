import { MikroORM } from '@mikro-orm/core';
import { Express, Request, Response } from 'express'
import { User } from '../entities/User'
import { login, register } from '../api/auth'

export default function setupAuth(app: Express, db: MikroORM) {
    
    app.post("/register", async (req: Request, res: Response) => {
        const { username, email, password } = req.body
        let user = await register(db.em, { username, email, password })
        if (user instanceof User) {
            req.session.userId = user.id
        } 
        res.status(200).json(user)
    })

    app.post("/login", async (req: Request, res: Response) => {
        const { email, password } = req.body
        const user = await login(db.em, { email, password })
        if (user instanceof User) {
            req.session.userId = user.id
        }        
        res.status(200).json(user)
    })

    app.post("/logout", (req, res) => {
        req.session.destroy(() => {})
        res.status(200).json("Logged out!")
    })
}