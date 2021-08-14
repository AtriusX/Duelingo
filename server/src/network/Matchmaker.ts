import { User } from "../entities/User"
import GameTracker from './GameTracker';

export default class MatchMaker {
  private pool: User[] = []
  private static inst: MatchMaker

  private constructor() {
    setInterval(async () => await this.match(), 5000)
  }

  public static get(): MatchMaker {
    if (this.inst === undefined)
      this.inst = new MatchMaker()
    return this.inst
  }

  public add(user: User) {
      if (GameTracker.get().has(user.id))
        return
      if (!this.pool.includes(user))
        this.pool.push(user)
  }

  public remove(user: User | number) {
      this.pool = this.pool.filter(u => u.id !== (user instanceof User ? user.id : user))
  }

  private async match() {
    let a = this.random(), b = this.random()
    if (a === b)
        return
    this.connect(a, b)
  }

  private async connect(a: User, b: User) {
    // Connect via game system manager
    if (GameTracker.get().connect(a.id, b.id, true)) {
        this.remove(a)
        this.remove(b)
    }
  }

  private random() {
      return this.pool[Math.floor(Math.random() * this.pool.length)]
  }
}
