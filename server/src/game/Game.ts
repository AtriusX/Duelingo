import { getPoints, getRankPoints, rankUp } from "../api/user"
import { Language } from "./../types"
import { em } from "./../"
import { User } from "../entities/User"
import ConnectionRepository from "../network/ConnectionRepository"
import Question, { PublicQuestion } from "./Question"
import GameEntity from "../entities/Game"
import GameResult from "../entities/GameResult"
import QuestionManager from "./QuestionManager"

interface Player {
  id: number
  score: number
  streak: number
}

export default class Game {
  readonly a: Player
  readonly b: Player
  readonly competitive: boolean
  private uuid: string
  private started: boolean = false
  private over: boolean = false
  private lang: Language
  private time: number
  private current: Question

  constructor(
    a: number,
    b: number,
    uuid: string,
    competitive: boolean = false,
    lang: Language = "es",
    time: number = 5 * 60 // 5 minutes
  ) {
    this.a = { id: a, score: 0, streak: 0 }
    this.b = { id: b, score: 0, streak: 0 }
    this.uuid = uuid
    this.competitive = competitive
    this.lang = lang
    this.time = time
    this.timeSync()
  }

  public has(id: number): boolean {
    return this.a.id === id || this.b.id === id
  }

  public async getOpponent(self: number): Promise<User | null> {
    return await em.findOne(User, {
      id: self !== this.a.id ? this.a.id : this.b.id,
    })
  }

  public getState(): [
    Player,
    Player,
    boolean,
    [number, number?],
    PublicQuestion | undefined
  ] {
    return [
      this.a,
      this.b,
      this.started,
      this.started ? [this.time, this.current.timeRemaining()] : [5],
      this.current?.getPublic(),
    ]
  }

  public isOver(): boolean {
    return this.over
  }

  public async end() {
    if (this.competitive && !this.over) {
      em.persist(new GameEntity(this.uuid, this.lang))
      em.persist(this.getResult(this.a, this.b))
      em.persist(this.getResult(this.b, this.a))
      await em.flush()
      this.tryRankUp(this.a.id)
      this.tryRankUp(this.b.id)
    }
    this.over = true
  }

  private async tryRankUp(id: number) {
    let points = await getPoints(id)
    let [, , rank] = getRankPoints(points)
    rankUp(id, rank)
  }

  private getResult(player: Player, opponent: Player) {
    return new GameResult(
      player.id,
      opponent.id,
      this.uuid,
      player.score,
      player.score === opponent.score
        ? undefined
        : player.score > opponent.score
    )
  }

  private timeSync() {
    setTimeout(async () => {
      this.started = true
      let q = await QuestionManager.random(em, this.lang)
      if (q) this.setQuestion(q)
      else this.over = true
      const interval = setInterval(async () => {
        // Perhaps this can be simplified now that the system is fixed
        this.socket("update-timer", this.time, this.current.timeRemaining())
        if (this.current.expired()) {
          let q = await QuestionManager.random(em, this.lang)
          // If no question is found, then we can assume the game cannot continue
          if (q) this.setQuestion(q)
          else this.over = true
        }
        if (this.isOver() || this.time-- <= 0) {
          clearInterval(interval)
          this.end()
        }
      }, 1000)
    }, 5000)
  }

  public answer(id: number, choice: number): boolean {
    let correct = this.current.answer(id, choice)
    this.addScore(id, correct)
    if (correct) this.current.expire()
    return correct
  }

  private serveQuestion() {
    this.socket("question", this.current?.getPublic())
  }

  private addScore(id: number, correct: boolean) {
    let ids = [this.a, this.b]
    ids.forEach((p) => {
      if (p.id === id) {
        let score
        if (correct) {
          p.streak++
          score = p.streak * 10
        } else {
          score = -10
          p.streak = 0
        }
        p.score += score
        this.socket("update-score", p.score, p.streak, p.id)
      }
    })
  }

  public socket(event: string, ...data: any) {
    let repo = ConnectionRepository.get()
    let ids = [this.a.id, this.b.id]
    ids.forEach((id) => repo.relay(id, (s) => s.emit(event, ...data)))
  }

  private setQuestion(question: Question) {
    this.current = question
    this.serveQuestion()
  }
}
