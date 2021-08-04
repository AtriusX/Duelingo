import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export default class Participant {
  constructor(userId: number, gameId: number) {
    this.userId = userId
    this.gameId = gameId
  }

  @PrimaryKey()
  id!: number

  @Property()
  userId!: number

  @Property()
  gameId!: number
}
