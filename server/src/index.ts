import { DEV } from './global';
import { MikroORM } from "@mikro-orm/core";
import DatabaseConfig from "./config/db";
import cors from "cors";
import { json } from "body-parser";
import session from "express-session";
import express from "express";
import setupAuth from "./components/auth";
import setupUser from "./components/user";
import { CorsConfig } from "./config/cors";
import { SessionConfig } from "./config/session";
import { User } from "./entities/User";
import faker from "faker"
import { hash } from 'argon2';
import chalk from "chalk"
import setupRivals from './components/rival';

async function main() {
  const db = await MikroORM.init(DatabaseConfig);
  await db.getMigrator().up();
  // This will run a setup query to provide us with fake data in development
  let count = await db.em.count(User, {})
  if (DEV && count < 1000) {
    console.log(chalk.magenta("Generate test data... Please wait..."))
    for (let i = 0; i < 1000 - count; i++) {
      const name = faker.name.findName()
      const email = faker.internet.email().toLowerCase()
      const password = await hash(faker.internet.password())
      db.em.persist(new User(name, email, password))
    }
    db.em.flush()
  }

  const app = express();
  app.use(
    cors(CorsConfig), json(), session(SessionConfig)
  );
  setupAuth(app, db)
  setupUser(app, db)
  setupRivals(app, db)
  app.listen(3000, () => console.log("Listening on port 3000!"));
}

main().catch(console.error);
