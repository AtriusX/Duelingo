import client from "./config";

export async function register(email: string, username: string, password: string) {
    return client.post("/register", { email, username, password })
}

export async function login(email: string, password: string) {
    return client.post("/login", { email, password })
}

export async function logout() {
    return client.post("/logout")
}