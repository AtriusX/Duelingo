import { em } from './../';
import { User } from "../entities/User"
import ConnectionRepository from '../network/ConnectionRepository';

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
  
  constructor(a: number, b: number, competitive: boolean = false, time: number = 300) {
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
    return await em.findOne(User, { id: self !== this.a.id ? this.a.id : this.b.id })
  }

  public getState(): [number, number, boolean, number] {
    return [this.a.score, this.b.score, this.started, this.started ? this.time : 5]
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
      const interval = setInterval(() => {
          if (this.time % 15 === 0)
              this.socket("update-timer", this.time)
          if (this.over || this.time-- <= 0) {
              this.end()
              clearInterval(interval)
          }
      }, 1000)
    }, 5000)
  }

  public socket(event: string, ...data: any) {
      let repo = ConnectionRepository.get()
      repo.recall(this.a.id).then(v => v?.socket?.emit(event, ...data))
      repo.recall(this.b.id).then(v => v?.socket?.emit(event, ...data))
  }
}
