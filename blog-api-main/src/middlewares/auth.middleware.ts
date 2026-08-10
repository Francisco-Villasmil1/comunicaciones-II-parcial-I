import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../shared/appError";
import { AUTH_CONFIG } from "../modules/auth/auth.constants";

type JwtPayload = {
  sub?: string;
};

export const requireAuth: RequestHandler = (request, _response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError("Token no enviado.", 401));
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.verify(token, AUTH_CONFIG.jwtSecret) as JwtPayload;

    if (!payload.sub) {
      return next(new AppError("Token invalido.", 401));
    }

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId)) {
      return next(new AppError("Token invalido.", 401));
    }

    request.authUserId = userId;
    return next();
  } catch {
    return next(new AppError("Token invalido o expirado.", 401));
  }
};
