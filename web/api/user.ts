// All of this is VERY rought right now, this will probably need to be changed later
export async function self(sessionToken: string | undefined) {
    return fetch("http://localhost:3000/user/me", {
        method: "GET",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionToken ?? ""
        }
    }).then(async u => await u.json())
}