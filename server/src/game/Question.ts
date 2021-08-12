import QuestionEntity from "../entities/Question"
export interface PublicQuestion {
  question: string
  choices: string[]
}

export default class Question implements PublicQuestion {
  question: string
  choices: string[]
  private correct: number
  private answerCount: Set<Number> = new Set()
  private answered: boolean = false
  private maxUsers: number
  private created: number = Date.now()
  private _expire: number

  static from({ question, choices, answer }: QuestionEntity) {
    return new Question(question, choices.map(q => q.toString()), answer)
  }

  constructor(
    question: string,
    choices: string[],
    correct: number,
    maxUsers: number = 2
  ) {
    this.question = question
    this.choices = choices
    if (correct < 0 || correct >= choices.length)
      throw new Error("Question correct index is out of bounds!")
    this.correct = correct
    this.maxUsers = maxUsers
  }

  public getPublic(): PublicQuestion {
    return { question: this.question, choices: this.choices }
  }

  public answer(id: number, choice: number): boolean {
    if (this.answerCount.has(id) || this.answered) return false
    this.answerCount.add(id)
    let correct = choice === this.correct
    if (correct) this.answered = true
    return correct
  }

  public expire() {
    this._expire = Date.now()
  }

  // Question expires if the time of creation is 10 seconds ago or the question has been answered by all users
  public expired(): boolean {
    if (this.answerCount.size === this.maxUsers && !this._expire) this.expire()
    return this._expire + 1000 < Date.now() || this.created + 10000 < Date.now()
  }
}
