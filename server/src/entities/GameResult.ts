import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export default class GameResult {
  constructor(
    participantId: number,
    opponentId: number,
    gameId: string,
    score: number,
    won?: boolean
  ) {
    this.participantId = participantId
    this.opponentId = opponentId
    this.gameId = gameId
    this.score = score
    this.won = won
  }

  @PrimaryKey()
  id!: number

  @Property()
  participantId!: number

  @Property()
  opponentId!: number

  @Property()
  gameId!: string

  @Property({ nullable: true })
  won?: boolean

  @Property()
  score!: number

  @Property({ type: "date" })
  createdAt: Date = new Date()
}
