import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export default class GameResult {
  constructor(participantId: number, won: boolean, score: number) {
    this.participantId = participantId
    this.won = won
    this.score = score
  }

  @PrimaryKey()
  id!: number

  @Property()
  participantId!: number

  @Property()
  won!: boolean

  @Property()
  score!: number
}
