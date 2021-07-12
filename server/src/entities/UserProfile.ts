import { PrimaryKey, Property } from "@mikro-orm/core";

export class UserProfile {

    constructor(id: number, avatar?: string, description?: string) {
        this.id = id
        this.avatar = avatar
        this.description = description
    }

    @PrimaryKey()
    id!: number

    @Property({ type: "text" })
    avatar?: string

    @Property({ type: "text" })
    description?: string
}