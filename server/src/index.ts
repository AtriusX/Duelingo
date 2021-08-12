import { EntityManager, MikroORM } from "@mikro-orm/core"
import DatabaseConfig from "./config/db"
import cors from "cors"
import { json } from "body-parser"
import session from "express-session"
import express from "express"
import setupAuth from "./components/auth"
import setupUser from "./components/user"
import { CorsConfig } from "./config/cors"
import { SessionConfig } from "./config/session"
import chalk from "chalk"
import setupRivals from "./components/rival"
import { createServer } from "http"
import { setupSockets } from "./network/socket"
import setupGame from "./components/game"
import { setupLeaderboards } from "./components/leaderboards"
import setupDefaults from "./components/defaults"

export let em: EntityManager

async function main() {
  const db = await MikroORM.init(DatabaseConfig)
  em = db.em
  await db.getMigrator().up()

  const app = express()
  console.log(chalk.blue("Setting up features..."))
  const sess = session(SessionConfig)
  app.use(cors(CorsConfig), json(), sess)
  const http = createServer(app)

  setupDefaults()
  setupSockets(http, sess)
  setupAuth(app, db)
  setupUser(app, db)
  setupRivals(app, db)
  setupGame(app, db)
  setupLeaderboards(app, db)

  http.listen(3000, () => console.log(chalk.green("Listening on port 3000!")))
}

main().catch(console.error)
