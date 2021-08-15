import session from "express-session"
import Redis from "ioredis"
import connectRedis from "connect-redis"
import chalk from "chalk"

type Session = Parameters<typeof session>[0]

const RedisStore = connectRedis(session)

export const client = new Redis(process.env.REDIS_URL)

client.on("connect", () =>
  console.log(chalk.yellowBright("Connected to Redis!"))
)

export const SessionConfig: Session = {
  secret: process.env.SESSION_SECRET!,
  store: new RedisStore({
    client: client,
    disableTouch: true,
  }),
  cookie: {
    maxAge: 1000000000000,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },
  saveUninitialized: false,
  resave: false,
}
