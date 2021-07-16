import { DEV } from "../global";
import session from "express-session";

type Session = Parameters<typeof session>[0];

export const SessionConfig = {
  secret: "3292583249053486903",
  cookie: {
    maxAge: 1000000000000,
    httpOnly: true,
    sameSite: "lax",
    secure: !DEV,
  },
  saveUninitialized: false,
} as Session;
