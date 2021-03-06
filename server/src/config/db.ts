import QuestionEntity from "../entities/Question"
import { User } from "../entities/User"
import { MikroORM } from "@mikro-orm/core"
import path from "path"
import { DBTYPE, DBUSER, DBPASS, DEV, DBNAME } from "../global"
import { Rivalry } from "../entities/Rivalry"
import Participant from "../entities/Participant"
import Game from "../entities/Game"
import GameResult from "../entities/GameResult"
import LeaderboardSnapshot from "../entities/LeaderboardSnapshot"
import { PostgreSqlDriver } from "@mikro-orm/postgresql"

const entities = [
  User,
  Rivalry,
  Participant,
  Game,
  GameResult,
  LeaderboardSnapshot,
  QuestionEntity,
]

type Config = Parameters<typeof MikroORM.init>[0]

const DatabaseConfig = {
  dbName: DBNAME,
  debug: DEV,
  host: process.env.DATABASE_URL,
  type: DBTYPE,
  driver: PostgreSqlDriver,
  user: DBUSER,
  password: DBPASS,
  entities: entities,
  migrations: {
    path: path.join(__dirname, "../migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as Config

export default DatabaseConfig
