import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no esta definida.");
}

export const env = {
  port,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET ?? "blog_secret_key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
};
