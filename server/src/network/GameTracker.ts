import { v4 } from 'uuid';
import ConnectionRepository from './ConnectionRepository';

type Game = Map<string, [number, number]>

export default class GameTracker {
  private static inst: GameTracker
  private games: Game = new Map()

  public static get() {
    if (this.inst === undefined) this.inst = new GameTracker()
    return this.inst
  }

  public connect(a: number, b: number): boolean | string {
    if (this.has(a) || this.has(b)) {
      console.log("Could not connect users to game");
      return false
    }
    let gameId = v4()
    this.join(a, gameId)
    this.join(b, gameId)
    this.games.set(gameId, [a, b])
    console.log(this.games);
    
    return gameId
  }

  public key(id: number) {
    for (let [key, v] of this.games) {
      if (v.includes(id))
        return key
    }
    return undefined
  }

  public has(id: number) {
    return this.key(id) !== undefined
  }

  public drop(id: number) {
    
    let key = this.key(id)
    if (key) {
      console.log("Dropped game", key, "from pool");
      this.games.delete(key)
    }
  }

  private join(id: number, gameId: string) {
    ConnectionRepository.get().recall(id).then(c => c?.socket?.emit("join-game", gameId))
  }
}
