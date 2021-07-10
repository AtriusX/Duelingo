import { DEV } from './global';
import { User } from './entities/User';
import { MikroORM } from '@mikro-orm/core';
import DatabaseConfig from './config/db';
import express, { Request, Response } from 'express';
import cors from 'cors'
import { json } from 'body-parser'
import register from './api/register';
import login from './api/login';
import session from 'express-session'

async function main() {
    const db = await MikroORM.init(DatabaseConfig)
    await db.getMigrator().up()

    const app = express()
    
    app.use(cors({
        // This is to ensure each endpoint on our back-end is covered by the allow access policy
        origin: function (origin, callback) {
            callback(null, origin)
        },
        // Allows the session cookie to be saved on the front end client automatically
        credentials: true,
    }), json())

    // Sessions support
    app.use(session({
        secret: "3292583249053486903",
        cookie: { 
            maxAge: 1000000000000,
            httpOnly: true,
            sameSite: "none",
            secure: !DEV
         },
        saveUninitialized: false
    }))

    app.get("/", (req, res) => {
        if ((req.session as any).userId) {
            return res.redirect("/home")
        }
        res.status(200).json(req.session)
    })

    app.get("/home", async (req, res) => {
        if ((req.session as any).userId) {
            // @ts-ignore
            const user = await db.em.findOne(User, req.session.userId)
            res.send(`Hello ${user.displayName}!`)
        } else {
            res.redirect("/")
        }
    })

    app.get("/user/me", async (req, res) => {
        const sess: any = req.session
        res.status(200).json(await db.em.findOne(User, { id: sess.userId }))
    })

    app.get("/user/:id", async (req: Request, res: Response) => {
        const user = await db.em.findOne(User, { id: parseInt(req.params.id) || 0 }) ?? { error: "No user found!" }        
       
        res.status(200).json(user)

    })

    app.post("/register", async (req: Request, res: Response) => {
        const { username, email, password } = req.body
        console.log(req.body);
        
        let user = await register(db.em, { username, email, password })
        if (user instanceof User) {
            const sess: any = req.session
            sess.userId = user.id
        } 
        res.status(200).json(user)
    })

    app.post("/login", async (req: Request, res: Response) => {
        const { email, password } = req.body
        const user = await login(db.em, { email, password })
        if (user instanceof User) {
            const sess: any = req.session
            sess.userId = user.id
        }        
        res.status(200).json(user)
    })

    app.post("/logout", (req, res) => {
        req.session.destroy(() => {})
        res.status(200).json("Logged out!")
    })

    app.listen(3000, () => console.log("Listening on port 3000!"))
}

main().catch((err) => console.error(err))
