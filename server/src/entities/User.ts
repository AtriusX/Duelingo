import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class User {

    constructor(displayName: string, email: string, password: string, language: Language = "en") {
        this.displayName = displayName
        this.email = email
        this.password = password
        this.language = language
    }

    @PrimaryKey()
    id!: number

    @Property({ type: "text" })
    displayName!: string

    @Property({ type: "text", unique: true })
    email!: string

    @Property({ type: "text" })
    password!: string

    @Property({ type: "date" })
    joined: Date = new Date()

    @Property({ type: "text", onUpdate: () => new Date() })
    updated: Date = new Date()

    @Property({ type: "text" })
    language!: Language

    @Property({ type: "text", default: "D" })
    rank: string = "D"
}