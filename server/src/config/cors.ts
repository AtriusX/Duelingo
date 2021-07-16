import cors from "cors";

type Cors = Parameters<typeof cors>[0];

export const CorsConfig = {
  // This is to ensure each endpoint on our back-end is covered by the allow access policy
  origin: (origin, callback) => callback(null, origin),
  // Allows the session cookie to be saved on the front end client automatically
  credentials: true,
} as Cors;
