// import ConnectionRepository from '../network/ConnectionRepository';
import { sessionId } from "./../api/index"
import argon2 from "argon2"
import { Express, Request, Response } from "express"
import { MikroORM } from "@mikro-orm/core"
import { User } from "../entities/User"
import { getGames, getStats, getUpdates, search, updateUser } from "../api/user"
import { deleteUser } from "../api/auth"
import ConnectionRepository from "../network/ConnectionRepository"

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
    if (result == true) req.session.destroy(() => {})
    res.status(200).json(result)
  })

  app.get("/user/stats", async (req: Request, res: Response) => {
    const id = req.session.userId
    res.status(200).json(await getStats(id))
  })

  app.get("/user/:id", async (req: Request, res: Response) => {
    const user = await db.em.findOne(User, { id: parseInt(req.params.id) || 0 })
    if (!user) return res.status(404).json({ error: "No user found!" })
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
    if (
      !!body.password?.length &&
      user &&
      !(await argon2.verify(user.password, body.existing))
    )
      return res
        .status(200)
        .json({ message: "Existing password does not match current password!" })
    const update = await updateUser(db.em, body, userId)
    return res.status(200).json(update)
  })

  app.post("/updates", async (req: Request, res: Response) => {
    const userId = sessionId(req.session)
    const page = req.body.page
    res.status(200).json(await getUpdates(db.em, userId, page))
  })

  app.post("/forget", async (req: Request, res: Response) => {
    const id = req.session?.userId
    if (!!id) ConnectionRepository.get().drop(id)
    return res.status(200)
  })

  app.get("/user/:id/games/:page", async (req: Request, res: Response) => {
    const id = parseInt(req.params["id"]) || 0
    const page = parseInt(req.params["page"]) || 0
    res.status(200).json(await getGames(id, page))
  })
}
