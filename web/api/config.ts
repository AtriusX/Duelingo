import { request, RequestType } from "../utils"

class Client {
    
    constructor(url: string, port: number) {
        this.BASE_API_URL = `${url}:${port}`
    }

    BASE_API_URL!: string

    private async request(path: string, method: RequestType, data?: object) {        
        return request(`${this.BASE_API_URL}${path}`, method, data)
    }

    async get(path: string) {
        return this.request(path, "GET", undefined)
    }

    async post(path: string, data: object = {}) {
        return this.request(path, "POST", data)
    }

    async del(path: string, data: object = {}) {
        return this.request(path, "DELETE", data)
    }

    async put(path: string, data: object = {}) {
        return this.request(path, "PUT", data)
    }
}

const client: Client = new Client("http://localhost", 3000)

export default client