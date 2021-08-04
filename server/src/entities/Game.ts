import { Entity } from "@mikro-orm/core"
import { Language } from "./../types"
import { PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export default class Game {
  constructor(uuid: string, competitive?: boolean, language?: Language) {
    this.uuid = uuid
    if (competitive) this.competitive = competitive
    if (language) this.language = language
  }

  @PrimaryKey()
  id!: number

  @Property({ unique: true })
  uuid!: string

  @Property({ default: false })
  competitive!: boolean

  @Property({ type: "text", default: "en" })
  language!: Language
}
