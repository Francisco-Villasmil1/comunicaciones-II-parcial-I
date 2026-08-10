import type { RequestHandler } from "express";
import { RolUsuario } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { AppError } from "../shared/appError";

export const requireDueno: RequestHandler = async (request, _response, next) => {
  try {
    if (!request.authUserId) {
      return next(new AppError("Usuario no autenticado.", 401));
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: request.authUserId },
      select: { rol: true, isActive: true },
    });

    if (!usuario) {
      return next(new AppError("Usuario no encontrado.", 401));
    }

    if (!usuario.isActive) {
      return next(new AppError("Usuario inactivo.", 403));
    }

    if (usuario.rol !== RolUsuario.DUENO) {
      return next(new AppError("Acceso reservado al dueño del blog.", 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
