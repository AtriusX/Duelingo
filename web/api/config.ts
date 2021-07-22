import { cast } from './../utils';
import { request, RequestType } from "../utils"
import { address } from '../../env'

class Client {
    
    constructor(url: string, port: number) {
        this.BASE_API_URL = `${url}:${port}`
    }

    BASE_API_URL!: string

    private async request(path: string, method: RequestType, data?: object) {        
        return request(`${this.BASE_API_URL}${path}`, method, data)
    }

    private async authRequest(path: string, token: string, method: RequestType, data?: object) {
        return fetch(`${this.BASE_API_URL}${path}`, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': token ?? "",
                'Secure': "true"   
            },
            body: JSON.stringify(data)
        }).then(async u => !u ? u : await u.json())
    }

    async get<T = any>(path: string) {
        return cast<Promise<T>>(this.request(path, "GET", undefined))
    }

    async secureGet<T = any>(path: string, token: string) {
        return cast<Promise<T>>(this.authRequest(path, token, "GET", undefined))
    }

    async post<T = any>(path: string, data: object = {}) {
        return cast<Promise<T>>(this.request(path, "POST", data))
    }

    async securePost<T = any>(path: string, token: string, data: object = {}) {
        return cast<Promise<T>>(this.authRequest(path, token, "POST", data))
    }

    async del(path: string, data: object = {}) {
        return this.request(path, "DELETE", data)
    }

    async put(path: string, data: object = {}) {
        return this.request(path, "PUT", data)
    }
}

const client: Client = new Client(`http://${address}`, 3000)

export default client