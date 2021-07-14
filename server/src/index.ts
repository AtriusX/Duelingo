// import { User } from './entities/User';
import { DEV } from "./global";
import { MikroORM } from "@mikro-orm/core";
import DatabaseConfig from "./config/db";
import cors from "cors";
import { json } from "body-parser";
import session from "express-session";
import express from "express";
import setupAuth from "./components/auth";
import setupUser from "./components/user";

async function main() {
  const db = await MikroORM.init(DatabaseConfig);
  await db.getMigrator().up();
  // for (let i = 0; i < 1000; i++) {
  //   console.log(i);
    
  //   db.em.persist(new User("werew", (Math.random() * 123 ).toString(), "gergwerthrthr"))
  // }
  // db.em.flush();

  const app = express();
	// Need to migrate these around later to an isolated spot
  app.use(
    cors({
      // This is to ensure each endpoint on our back-end is covered by the allow access policy
      origin: (origin, callback) => callback(null, origin),
      // Allows the session cookie to be saved on the front end client automatically
      credentials: true
    }),
    json(),
    session({
      secret: "3292583249053486903",
      cookie: {
        maxAge: 1000000000000,
        httpOnly: true,
        sameSite: "lax",
        secure: !DEV,
      },
      saveUninitialized: false,
    })
  );

  setupAuth(app, db);
  setupUser(app, db);

  app.listen(3000, () => console.log("Listening on port 3000!"));
}

main().catch(console.error);
