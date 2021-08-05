import { User } from "../entities/User"
import { v4 } from "uuid"
import ConnectionRepository from "./ConnectionRepository"
import Game from "../game/Game"

export default class GameTracker {
  private static inst: GameTracker
  private games = new Map<string, Game>()

  public static get() {
    if (this.inst === undefined) this.inst = new GameTracker()
    return this.inst
  }

  public connect(
    a: number,
    b: number,
    competitive: boolean = false
  ): boolean | string {
    if (this.has(a) || this.has(b)) {
      console.log("Could not connect users to game")
      return false
    }
    let gameId = v4()
    this.join(a, gameId)
    this.join(b, gameId)
    this.games.set(gameId, new Game(a, b, competitive))
    console.log(this.games)

    return gameId
  }

  public key(id: number) {
    for (let [key, game] of this.games) {
      if (game.has(id)) return key
    }
    return undefined
  }

  public has(id: number) {
    return this.key(id) !== undefined
  }

  public drop(id: number) {
    let key = this.key(id)
    if (key) {
      console.log("Dropped game", key, "from pool")
      let game = this.games.get(key)
      if (!game?.isOver()) game?.socket("game-dropped")
      game?.end()
      this.games.delete(key)
    }
  }

  public getGame(gameId: string): Game | undefined {
    return this.games.get(gameId)
  }

  public async getOpponent(uuid: string, self: number): Promise<User | null> {
    let game = this.games.get(uuid) ?? null
    return !game ? null : game.getOpponent(self)
  }

  private join(id: number, gameId: string) {
    ConnectionRepository.get()
      .recall(id)
      .then((c) => c?.socket?.emit("join-game", gameId))
  }
}
