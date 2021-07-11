import { Configuration } from '@mikro-orm/core';

export const DEV = process.env.NODE_ENV !== "production"

export const DBNAME = "capstone"

export const DBTYPE: keyof typeof Configuration.PLATFORMS = "postgresql"

export const DBUSER = "postgres"

export const DBPASS = "password"