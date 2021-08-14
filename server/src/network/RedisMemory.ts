import { Option } from './../types';
import Redis from "ioredis"

export default class RedisMemory<V = string> {
  private readonly _name: string
  private readonly redis: Redis.Redis
  private readonly toString: (inp: V | string) => string
  private readonly parse: (inp: string) => V
  private autoDrop?: number

  private constructor(
    name: string, 
    toString: (inp: V | string) => string, 
    parse: (inp: string) => V,
    autoDrop?: number
  ) {
    this._name = name
    this.redis = new Redis({
      keyPrefix: name,
      host: process.env.REDIS_URL
    })
    this.toString = toString
    this.parse = parse
    this.autoDrop = autoDrop
  }

  public static create<V = string>(
    name: string, 
    toString: (inp: V | string) => string, 
    func: (inp: string) => V,
    autoDrop?: number
  ): RedisMemory<V> {
    return new RedisMemory<V>(name, toString, func, autoDrop)
  }

  get name(): string {
    return this._name
  }

  public store(key: string | number, value: V) {
    this.redis.set(key.toString(), this.toString(value))
    if (this.autoDrop)
      this.redis.expire(key.toString(), this.autoDrop)
  }

  public async recall(key: string | number): Promise<Option<V>> {      
    try {
      return this.parse(await this.redis.get(key.toString()) ?? "")
    } catch (err) {
      return undefined
    }
  }

  public forget(key: string | number) {
    this.redis.del(key.toString())
  }
}
