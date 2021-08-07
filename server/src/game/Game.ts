import { Language } from "./../types"
import { em } from "./../"
import { User } from "../entities/User"
import ConnectionRepository from "../network/ConnectionRepository"
import Question, { PublicQuestion } from "./Question"
import GameEntity from "../entities/Game"
import GameResult from "../entities/GameResult"

interface Player {
  id: number
  score: number
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
    this.a = { id: a, score: 0 }
    this.b = { id: b, score: 0 }
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
    number,
    PublicQuestion | undefined
  ] {
    return [
      this.a,
      this.b,
      this.started,
      this.started ? this.time : 5,
      this.current?.getPublic(),
    ]
  }

  public isOver(): boolean {
    return this.over
  }

  public end() {
    this.over = true
    if (this.competitive) {
      em.persist(new GameEntity(this.uuid, this.lang))
      em.persist(this.getResult(this.a, this.b))
      em.persist(this.getResult(this.b, this.a))
      em.flush()
    }
  }

  private getResult(player: Player, opponent: Player) {
    return new GameResult(
      player.id,
      opponent.id,
      this.uuid,
      player.score > opponent.score,
      player.score
    )
  }

  private timeSync() {
    setTimeout(() => {
      this.started = true
      this.setQuestion(new Question("Example", ["A", "B", "C", "D"], 1))
      const interval = setInterval(() => {
        // Perhaps this can be simplified now that the system is fixed
        this.socket("update-timer", this.time)
        if (this.current.expired())
          this.setQuestion(
            new Question(`Example ${this.time}`, ["A", "B", "C", "D"], 2)
          )
        if (this.isOver() || this.time-- <= 0) {
          clearInterval(interval)
          this.end()
        }
      }, 1000)
    }, 5000)
  }

  public answer(id: number, choice: number): boolean {
    let correct = this.current.answer(id, choice)
    this.addScore(id, correct ? 10 : -10)
    if (correct) this.current.expire()
    return correct
  }

  private serveQuestion() {
    this.socket("question", this.current?.getPublic())
  }

  private addScore(id: number, amt: number) {
    let ids = [this.a, this.b]
    ids.forEach((p) => {
      if (p.id === id) {
        p.score += amt
        this.socket("update-score", p.score, p.id)
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