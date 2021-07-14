/**
 * This function streamlines the process of aggregating form data into a json object.
 * This can be used to handle post requests with ease.
 */
export function getData<T>(form?: HTMLElement | EventTarget): T {
  let out = {} as any;
  let children = !!form ? (form as HTMLElement).children : document.querySelectorAll("input, textarea");
  for (let i = 0; i < children.length; i++) {
    let item = children.item(i);
    if (item instanceof HTMLInputElement || 
        item instanceof HTMLTextAreaElement || 
        item instanceof HTMLSelectElement
    ) {      
      out[item.id] = item.type !== "checkbox" ? item.value : (item as any).checked;
    }
  }
  return out as T;
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
export const cast = <T>(value: unknown) => value as T