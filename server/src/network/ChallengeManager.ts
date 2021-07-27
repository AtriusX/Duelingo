import { Error } from "../api"
import ConnectionRepository from "./ConnectionRepository"

type Challenge = Map<number, { busy: true } | { busy: false, challenges: [number, number][] }>

export default class ChallengeManager {
    private challenges: Challenge = new Map()
    private static inst: ChallengeManager

    private constructor() {
        // Automatically clear out expired challenges
        setInterval(() => {
            this.challenges.forEach((v, k) => {
                if (!v.busy)
                    v.challenges.forEach(async ([rivalId, time]) => {
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
    ): Promise<true | Error> {
        let chal = this.challenges.get(rival) ?? { busy: false, challenges: [] }
        if (chal.busy)
            return { message: "Rival is busy!" }
        if (!!this.getChallenge(id))
            return { message: "You have already challenged someone!" }
        if (this.getChallenge(rival) === id)
            return this.accept(id, rival)
        chal.challenges.push([id, Date.now() + (60 * 1000 * 2)])
        this.challenges.set(rival, chal)
        
        if (onChallenge)
            await onChallenge(id, rival)
        return true
    }

    public accept(id: number, rival: number, onAccept?: (id: number, rival: number) => void): true | Error {
        let challenges = this.challenges.get(id) ?? { busy: false, challenges: [] }
        if (challenges.busy)
            return { message: "You are already busy!" }
        if (!challenges.challenges.some(([r, time]) => r === rival && time > Date.now()))
            return { message: "That rival has not challenged you!" }
        this.setBusy(id, rival)
        this.setBusy(rival, id)
        
        if (onAccept)
            onAccept(id, rival)
        return true
    }

    public reject(id: number, rival: number, onReject?: (id: number, rival: number) => void): true | Error {
        let challenges = this.challenges.get(id) ?? { busy: false, challenges: [] }
        if (challenges.busy)
            return { message: "You are currently busy!" }
        challenges.challenges = challenges.challenges.filter(([rivalId, time]) => {
            let keep = rivalId !== rival
            if (!keep && time < Date.now() && onReject)
                onReject(id, rival)
            return keep
        })
        return true
    }

    public cancel(id: number, rival: number): true | Error {
        let challenges = this.challenges.get(rival) ?? { busy: false, challenges: [] }
        if (challenges.busy)
            return { message: "User is busy!" }
        challenges.challenges = challenges.challenges.filter(([otherId]) => id !== otherId)
        ConnectionRepository.get().recall(rival).then(c => 
            c?.socket?.emit("get-challenges", challenges.busy ? undefined : challenges.challenges)
        )
        this.challenges.set(rival, challenges)
        return true
    }

    public getChallenge(id: number): number | undefined {
        for (let [rival, v] of this.challenges) {
            if (!v.busy && v.challenges.some(c => c[0] === id)) {
                return rival
            }
        }
        return undefined
    }

    public getChallengers(id: number): [number, number][] | undefined {
        let chal = this.challenges.get(id)
        if (chal?.busy)
            return undefined
        return chal?.challenges
    }

    public isBusy(id: number) {
        return this.challenges.get(id)?.busy === true
    }

    public clear(id: number) {
        this.challenges.delete(id)
        this.challenges.forEach(v => {
            if (!v.busy)
                v.challenges = v.challenges.filter(v => v[0] !== id)
        })
    }

    private setBusy(id: number, rival: number) {
        this.clear(id)
        let chal = this.challenges.get(id)
        if (!chal?.busy)
            chal?.challenges.forEach(([rivalId]) => {
                if (rivalId !== rival)
                    this.reject(id, rivalId)
            })
        this.challenges.set(id, { busy: true })
    }
}