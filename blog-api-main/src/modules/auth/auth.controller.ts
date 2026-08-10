import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/appError";
import { authService } from "./auth.service";

export const authController = {
  async canRegister(_request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.canRegister();
      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const { nombre, apellido, correo, password } = request.body;

      if (!nombre || !apellido || !correo || !password) {
        throw new AppError(
          "nombre, apellido, correo y password son requeridos.",
          400,
        );
      }

      const result = await authService.register({
        nombre,
        apellido,
        correo,
        password,
      });

      return response.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const { correo, password } = request.body;

      if (!correo || !password) {
        throw new AppError("correo y password son requeridos.", 400);
      }

      const result = await authService.login({ correo, password });

      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async me(request: Request, response: Response, next: NextFunction) {
    try {
      if (!request.authUserId) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const user = await authService.me(request.authUserId);

      return response.json(user);
    } catch (error) {
      return next(error);
    }
  },
};
