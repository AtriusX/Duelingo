import { Error } from "../api"

type Challenge = Map<number, { busy: true } | { busy: false, challenges: [number, number][] }>

export default class ChallengeManager {
    private challenges: Challenge = new Map()
    private static inst: ChallengeManager

    private constructor() {}

    public static get(): ChallengeManager {
        if (this.inst == undefined)
            this.inst = new ChallengeManager()
        return this.inst
    }

    public challenge(id: number, rival: number, onChallenge?: (id: number, rival: number) => void): true | Error {
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
            onChallenge(id, rival)
        return true
    }

    public accept(id: number, rival: number, onAccept?: (id: number, rival: number) => void): true | Error {
        let challenges = this.challenges.get(id) ?? { busy: false, challenges: [] }
        if (challenges.busy)
            return { message: "You are already busy!" }
        if (!challenges.challenges.some(([r, time]) => r === rival && time > Date.now()))
            return { message: "That rival has not challenged you!" }
        this.setBusy(id)
        this.setBusy(rival)
        
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

    private clear(id: number) {
        this.challenges.delete(id)
        this.challenges.forEach(v => {
            if (!v.busy)
                v.challenges = v.challenges.filter(v => v[0] !== id)
        })
    }

    private setBusy(id: number) {
        this.clear(id)
        this.challenges.set(id, { busy: true })
    }
}