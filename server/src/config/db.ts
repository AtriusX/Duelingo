import { User } from '../entities/User';
import { MikroORM } from "@mikro-orm/core"
import path from "path"
import { DBTYPE, DBUSER, DBPASS, DEV, DBNAME } from "../global"

const entities = [User]

type Config = Parameters<typeof MikroORM.init>[0]

const DatabaseConfig = {
    dbName: DBNAME,
    debug: DEV,
    type: DBTYPE,
    user: DBUSER,
    password: DBPASS,
    entities: entities,
    migrations: {
        path: path.join(__dirname, "../migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
} as Config

export default DatabaseConfig