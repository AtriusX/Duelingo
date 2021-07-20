export const emailRegex = 
    /[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-z0-9](?:[a-zA-z0-9-]*[a-zA-z0-9])?\.)+[a-zA-z0-9](?:[a-zA-z0-9-]*[a-zA-z0-9])?/


type Session = {
  userId?: number
}

export interface Error {
  message: string
}

export const testRequirements = (
  value: string,
  block: (value: string) => boolean = basicFieldTest()
) => block(value)

export function basicFieldTest(low: number = 3, high: number = 20) { 
    return (v: string) => !!v && v.length >= low && v.length < high
}

export const emailFieldTest = (e: String) => 
  !!e && !!e.match(emailRegex)

export const sessionId = (session: Session | any) => session.userId