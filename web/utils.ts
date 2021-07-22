import { NextPageContext } from "next"
import { io, Socket } from "socket.io-client"

/**
 * This function streamlines the process of aggregating form data into a json object.
 * This can be used to handle post requests with ease.
 */
export function getData<T>(form?: HTMLElement | EventTarget): T { // change this
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
  | "DELETE";

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
    .catch((e) => console.log(e));
}

export function animate(selector: string, animationClass: string) {
  let e = document.querySelector(selector) as HTMLElement;
  if (e) {
    e.classList.add(animationClass);
    e.onanimationend = () => e?.classList.remove(animationClass);
  }
}

// Converts the rank id number to its letter representation or returns 'X' if the value is unsupported
export function getRank(value: number): string {
  return "DCBAS".charAt(value - 1) || "X"
}

// Helper function for force casting an object without needing to use "as unknown as Type"
export const cast = <T = any>(value: unknown) => value as T

// Server-side function to allow us to call a socket without explicitly specifiying its token in calls
export function callSocket(
  req: NextPageContext["req"],
  exec: (socket: Socket) => void
) {
  exec(
    io("http://localhost:3000", {
      extraHeaders: {
        "Cookie": req?.headers.cookie ?? ""
      }
    })
  )
}