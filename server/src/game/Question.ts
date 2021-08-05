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

  constructor(question: string, choices: string[], correct: number, maxUsers: number = 2) {
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
    if (this.answerCount.has(id) || this.answered)
        return false
    this.answerCount.add(id)
    let correct = choice === this.correct
    if (correct)
        this.answered = true
    return correct
  }

  // Question expires if the time of creation is 10 seconds ago or the question has been answered by all users
  public expired(): boolean {
      return this.answerCount.size === this.maxUsers || this.created + 10000 < Date.now()
  }
}
