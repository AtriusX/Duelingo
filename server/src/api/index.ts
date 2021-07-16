export const emailRegex =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

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