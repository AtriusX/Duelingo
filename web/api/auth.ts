import { Socket } from 'socket.io-client';
import router from "next/router";
import client from "./config";

export const emailRegex = 
    /[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-z0-9](?:[a-zA-z0-9-]*[a-zA-z0-9])?\.)+[a-zA-z0-9](?:[a-zA-z0-9-]*[a-zA-z0-9])?/

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

export async function tryLogout(socket?: Socket) {
  await logout()
  router.push("/")
  socket?.disconnect()
}