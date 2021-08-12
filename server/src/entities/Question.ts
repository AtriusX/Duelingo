import { Language } from "./../types"
import { Entity, PrimaryKey, Property, ArrayType } from "@mikro-orm/core"

@Entity()
export default class Question {
  constructor(
    question: string,
    choices: string[],
    answer: number,
    language: Language = "es"
  ) {
    this.question = question
    this.choices = choices
    this.answer = answer
    this.language = language
  }

  @PrimaryKey()
  id!: number

  @Property({ type: "text" })
  question!: string

  @Property({ type: ArrayType })
  choices!: string[]

  @Property()
  answer!: number

  @Property({ type: "text" })
  language!: Language
}
