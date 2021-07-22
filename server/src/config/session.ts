import { DEV } from "../global"
import session from "express-session"
import redis from "redis"
import connectRedis from "connect-redis"
import chalk from "chalk";

type Session = Parameters<typeof session>[0];

const RedisStore = connectRedis(session)

export const client = redis.createClient()

client.on("connect", () => 
  console.log(chalk.yellowBright("Connected to Redis!"))
)

export const SessionConfig: Session = {
  secret: "3292583249053486903",
  store: new RedisStore({
    client: client,
    disableTouch: true
  }),
  cookie: {
    maxAge: 1000000000000,
    httpOnly: true,
    sameSite: "lax",
    secure: !DEV,
  },
  saveUninitialized: false,
  resave: false
}
