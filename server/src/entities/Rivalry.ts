import { Entity, PrimaryKey, PrimaryKeyType, Property } from "@mikro-orm/core";
import { exception } from "console";

type RivalryStatus = "active" | "pending"

@Entity()
export class Rivalry {
    
    constructor(userA: number, userB: number) {
        if (userA == userB)
            throw exception("Cannot create a rivalry between a single person!")
        this.userA = Math.min(userA, userB)
        this.userB = Math.max(userA, userB)
    }

    @PrimaryKey()
    @Property()
    userA!: number
    
    @PrimaryKey()
    @Property()
    userB!: number

    [PrimaryKeyType]: [number, number]

    @Property({ type: "text" })
    status: RivalryStatus = "pending"

    @Property({ type: "date" })
    createdAt: Date = new Date()
}