import { env } from "../../config/env";

export const AUTH_CONFIG = {
  jwtSecret: env.jwtSecret,
  jwtExpiresIn: env.jwtExpiresIn,
  passwordSaltRounds: 10,
} as const;
