import { em } from "./../"
import { User } from "../entities/User"
import ConnectionRepository from "../network/ConnectionRepository"
import Question, { PublicQuestion } from "./Question"

interface Player {
  id: number
  score: number
}
export default class Game {
  readonly a: Player
  readonly b: Player
  readonly competitive: boolean
  private started: boolean = false
  private over: boolean = false
  private time: number
  private current: Question

  constructor(
    a: number,
    b: number,
    competitive: boolean = false,
    time: number = 5 * 60 // 5 minutes
  ) {
    this.a = { id: a, score: 0 }
    this.b = { id: b, score: 0 }
    this.competitive = competitive
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
  }

  private timeSync() {
    setTimeout(() => {
      this.started = true
      this.setQuestion(new Question("Example", ["A", "B", "C", "D"], 1))
      const interval = setInterval(() => {
        if (this.time % 15 === 0) this.socket("update-timer", this.time)
        if (this.current.expired())
          this.setQuestion(
            new Question(`Example ${this.time}`, ["A", "B", "C", "D"], 2)
          )
        if (this.over || this.time-- <= 0) {
          this.end()
          clearInterval(interval)
        }
      }, 1000)
    }, 5000)
  }

  public answer(id: number, choice: number): boolean {
    console.log(id, choice)
    let correct = this.current.answer(id, choice)
    console.log(id, "correct?", correct)
    if (correct) {
      this.addScore(id, 10)
      this.setQuestion(new Question("Correct!", ["1", "5", "7", "9"], 2))
    }
    // We need to update the current question and reserve if correct
    return correct
  }

  private serveQuestion() {
    this.socket("question", this.current?.getPublic())
  }

  private addScore(id: number, amt: number) {
    if (this.a.id === id) {
      this.a.score += amt
      this.socket("update-score", this.a.score, this.a.id)
    }
    if (this.b.id === id) {
      this.b.score += amt
      this.socket("update-score", this.b.score, this.b.id)
    }
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
