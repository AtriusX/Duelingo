/**
 * This function streamlines the process of aggregating form data into a json object. 
 * This can be used to handle post requests with ease.
 */
export function getData<T>(form: HTMLElement | EventTarget): T {
    let out = {} as any;
    let { children } = form as HTMLElement
    for (let i = 0; i < children.length; i++) {
        let item = children.item(i)
        if (item instanceof HTMLInputElement && item.labels) {
            out[item.id] = item.value
        }
    }
    return out as T
}

export type RequestType = "CONNECT" | "HEAD" | "OPTIONS" | "TRACE" | "GET" | "POST" | "PUT" | "DELETE"

export async function request(
    address: string, 
    type: RequestType = "GET", 
    body: object | string | undefined = undefined
): Promise<Response> {
    return fetch(address, {
        method: type,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: typeof body === "string" ? body : JSON.stringify(body)
    }).then(res => {
        return res.json()
    }).catch(e => console.log(e))
}


export function animate(selector: string, animationClass: string) {
    let e = document.querySelector(selector) as HTMLElement
    if (e) {
        e.classList.add(animationClass)
        e.onanimationend = () => e?.classList.remove(animationClass)
    }
}