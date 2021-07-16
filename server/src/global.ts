import { Configuration } from "@mikro-orm/core";

type Platform = keyof typeof Configuration.PLATFORMS;

export const DEV = process.env.NODE_ENV !== "production";

export const DBNAME = "capstone";

export const DBTYPE: Platform = "postgresql";

export const DBUSER = "postgres";

export const DBPASS = "password";
