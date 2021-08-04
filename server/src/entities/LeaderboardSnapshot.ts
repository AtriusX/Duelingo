import { Property, PrimaryKey, Entity } from "@mikro-orm/core"

@Entity()
export default class LeaderboardSnapshot {
  constructor(userId: number, score: number) {
    this.userId = userId
    this.score = score
  }

  @PrimaryKey()
  userId!: number

  @Property()
  score!: number
}
