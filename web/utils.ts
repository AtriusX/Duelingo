import { useState } from 'react';
/**
 * This function streamlines the process of aggregating form data into a json object.
 * This can be used to handle post requests with ease.
 */
export function getData<T>(form?: HTMLElement | EventTarget): T {
  // change this
  let values = Array.from(new FormData(form as HTMLFormElement))
  let out = {} as any
  values.forEach(([a, b]) => {
    out[a] = b
  })
  return out as T
}

export type RequestType =
  | "CONNECT"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"

export async function request(
  address: string,
  type: RequestType = "GET",
  body: object | string | undefined = undefined
): Promise<Response> {
  return fetch(address, {
    method: type,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((e) => console.log(e))
}

export function animate(selector: string, animationClass: string) {
  let e = document.querySelector(selector) as HTMLElement
  if (e) {
    e.classList.add(animationClass)
    e.onanimationend = () => e?.classList.remove(animationClass)
  }
}

// Converts the rank id number to its letter representation or returns 'X' if the value is unsupported
export function getRank(value: number): string {
  return "DCBAS".charAt(value - 1) || "X"
}

// Helper function for force casting an object without needing to use "as unknown as Type"
export const cast = <T = any>(value: unknown) => value as T

type Counter = (amt?: number) => void

export function useCounter(initial: number = 0): [number, Counter, Counter, () => void] {
  const [count, setCount] = useState(initial)
  const inc = (amt: number = 1) => setCount(count + amt)
  const dec = (amt: number = 1) => setCount(count - amt)
  const reset = () => setCount(0)
  return [count, inc, dec, reset]
}

export function usePartialState<T>(initial: T): [T, (state: Partial<T>) => void] {
  const [value, setValue] = useState(initial)
  const appender = (state: Partial<T>) => setValue({ ...value, ...state })
  return [value, appender]
}