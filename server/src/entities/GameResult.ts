import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export default class GameResult {
  constructor(
    participantId: number,
    opponentId: number,
    gameId: string,
    won: boolean,
    score: number
  ) {
    this.participantId = participantId
    this.opponentId = opponentId
    this.gameId = gameId
    this.won = won
    this.score = score
  }

  @PrimaryKey()
  id!: number

  @Property()
  participantId!: number

  @Property()
  opponentId!: number

  @Property()
  gameId!: string

  @Property()
  won!: boolean

  @Property()
  score!: number

  @Property({ type: "date" })
  createdAt: Date = new Date()
}
