import { Error } from "../api"
import ConnectionRepository from "./ConnectionRepository"
import GameTracker from "./GameTracker"

type Challenge = Map<number, [number, number][]>

export default class ChallengeManager {
    private challenges: Challenge = new Map()
    private static inst: ChallengeManager

    private constructor() {
        // Automatically clear out expired challenges
        setInterval(() => {
            this.challenges.forEach((v, k) => {
                v.forEach(async ([rivalId, time]) => {
                    if (time < Date.now()) {
                        this.cancel(rivalId, k)
                    }
                })
            })
        }, 1000)
    }

    public static get(): ChallengeManager {
        if (this.inst == undefined)
            this.inst = new ChallengeManager()
        return this.inst
    }

    public async challenge(
        id: number, 
        rival: number, 
        onChallenge?: (id: number, rival: number) => void | Promise<void>
    ): Promise<true | string | Error> {
        let chal = this.challenges.get(rival) ?? []
        if (!!this.getChallenge(id))
            return { message: "You have already challenged someone!" }
        if (this.getChallenge(rival) === id)
            return this.accept(id, rival)
        chal.push([id, Date.now() + (60 * 1000 * 2)])
        this.challenges.set(rival, chal)
        
        if (onChallenge)
            await onChallenge(id, rival)
        return true
    }

    public accept(id: number, rival: number, onAccept?: (id: number, rival: number) => void): string | Error {
        let challenges = this.challenges.get(id) ?? []
        if (!challenges.some(([r, time]) => r === rival && time > Date.now()))
            return { message: "That rival has not challenged you!" }
        let conn = GameTracker.get().connect(id, rival)
        if (typeof conn === "string") {
            this.setBusy(id, rival)
            this.setBusy(rival, id)
            if (onAccept)
                onAccept(id, rival)
            return conn
        }
        return { message: "Failed to connect game!" }
    }

    public reject(id: number, rival: number, onReject?: (id: number, rival: number) => void): true | Error {
        let challenges = this.challenges.get(id) ?? []
        challenges = challenges.filter(([rivalId, time]) => {
            let keep = rivalId !== rival
            if (!keep && time < Date.now() && onReject)
                onReject(id, rival)
            return keep
        })
        this.challenges.set(id, challenges)
        return true
    }

    public cancel(id: number, rival: number): true | Error {
        let challenges = this.challenges.get(rival) ?? []
        challenges = challenges.filter(([otherId]) => id !== otherId)
        ConnectionRepository.get().recall(rival).then(c => 
            c?.socket?.emit("get-challenges", challenges)
        )
        this.challenges.set(rival, challenges)
        return true
    }

    public getChallenge(id: number): number | undefined {
        for (let [rival, v] of this.challenges) {
            if (v.some(c => c[0] === id)) {
                return rival
            }
        }
        return undefined
    }

    public getChallengers(id: number): [number, number][] | undefined {
        let chal = this.challenges.get(id)
        return chal
    }

    public isBusy(id: number) {
        return GameTracker.get().has(id)
    }

    public clear(id: number) {
        this.challenges.delete(id)
        this.challenges.forEach(v => {
            v = v.filter(v => v[0] !== id)
        })
    }

    private setBusy(id: number, rival: number) {
        this.clear(id)
        let chal = this.challenges.get(id)
        chal?.forEach(([rivalId]) => {
            if (rivalId !== rival)
                this.reject(id, rivalId)
        })
        // this.challenges.set(id, { busy: true })
    }
}