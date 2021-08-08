import { Property, PrimaryKey, Entity } from "@mikro-orm/core"

@Entity()
export default class LeaderboardSnapshot {
  constructor(userId: number, score: number, rank: number) {
    this.userId = userId
    this.score = score
    this.rank = rank
  }

  @PrimaryKey()
  userId!: number

  @Property()
  score!: number

  @Property()
  rank!: number
}
