import { Configuration } from "@mikro-orm/core"

type Platform = keyof typeof Configuration.PLATFORMS

export const DEV = process.env.NODE_ENV !== "production"

export const DBNAME = process.env.DB_NAME!

export const DBTYPE: Platform = "postgresql"

export const DBUSER = process.env.DB_USER!

export const DBPASS = process.env.DB_PASS!

// This keeps our session data stored
declare module "express-session" {
  interface SessionData {
    userId: number
  }
}
