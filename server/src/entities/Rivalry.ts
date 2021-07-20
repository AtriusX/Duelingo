import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class Rivalry {
  constructor(sender: number, receiver: number) {
    this.sender = sender
    this.receiver = receiver
  }

  @PrimaryKey()
  id!: number

  @Property()
  sender!: number

  @Property()
  receiver!: number

  @Property()
  active: boolean = false

  @Property({ type: "date" })
  createdAt: Date = new Date()
}
