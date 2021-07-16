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

async function main() {
  const db = await MikroORM.init(DatabaseConfig);
  await db.getMigrator().up();
  const app = express();
  app.use(
    cors(CorsConfig), json(), session(SessionConfig)
  );
  setupAuth(app, db);
  setupUser(app, db);
  app.listen(3000, () => console.log("Listening on port 3000!"));
}

main().catch(console.error);
