import { Entity } from "@mikro-orm/core"
import { Language } from "./../types"
import { PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export default class Game {
  constructor(uuid: string, language?: Language) {
    this.uuid = uuid
    if (language) this.language = language
  }

  @PrimaryKey()
  id!: number

  @Property({ unique: true })
  uuid!: string

  @Property({ type: "text", default: "en" })
  language!: Language
}
