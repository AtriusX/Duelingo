import router from "next/router";
import client from "./config";

type NextApiResult = {
  props?: object,
  redirect?: {
    permanent: boolean;
    destination: string;
  };
};

export const homeRedirect: NextApiResult = {
  redirect: {
    permanent: false,
    destination: "/",
  },
};

export const noResult: NextApiResult = { props: {} };

export async function register(
  email: string,
  username: string,
  password: string
) {
  return client.post("/register", { email, username, password });
}

export async function login(email: string, password: string) {
  return client.post("/login", { email, password });
}

export async function logout() {
  return client.post("/logout");
}

export async function tryLogout() {
  await logout()
  router.push("/")
}