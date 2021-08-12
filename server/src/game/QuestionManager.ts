import { EntityManager } from "@mikro-orm/core"
import { Language } from "./../types"
import QuestionEntity from "../entities/Question"
import Question from "./Question"

const random = <T>(collection: Array<T>): T =>
  collection[Math.floor(Math.random() * collection.length)]

export default class QuestionManager {
  static async all(em: EntityManager, language?: Language): Promise<QuestionEntity[]> {
    return await em.find(QuestionEntity, { language })
  }

  static async random(em: EntityManager, language: Language): Promise<Question | null> {
    const questions = await this.all(em, language)
    if (questions.length <= 0) return null
    return Question.from(random(questions))
  }

  static async add(
    em: EntityManager,
    question: string,
    choices: string[],
    answer: number,
    language: Language,
    flush: boolean = true
  ) {
    em.persist(new QuestionEntity(question, choices, answer, language))
    if (flush) await em.flush()
  }

  static async addAll(
    em: EntityManager,
    ...questions: (QuestionEntity | [string, string[], number, Language])[]
  ) {
    for (let q of questions) {
      if (q instanceof QuestionEntity)
        await this.add(em, q.question, q.choices, q.answer, q.language, false)
      else await this.add(em, q[0], q[1], q[2], q[3], false)
    }
    await em.flush()
  }
}
