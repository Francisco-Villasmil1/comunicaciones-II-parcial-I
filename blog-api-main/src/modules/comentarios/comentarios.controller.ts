import type { NextFunction, Request, Response } from "express";
import { RolUsuario } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/appError";
import { parsePositiveInt } from "../../shared/parsePositiveInt";
import { comentariosService } from "./comentarios.service";

export const comentariosController = {
  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const page = parsePositiveInt(request.query.page, "page", 1);
      const limit = parsePositiveInt(request.query.limit, "limit", 10);

      let publicacionId: number | undefined;
      if (request.query.publicacionId && request.query.publicacionId !== "") {
        publicacionId = parsePositiveInt(
          request.query.publicacionId,
          "publicacionId",
        );
      }

      const result = await comentariosService.list({
        page,
        limit,
        publicacionId,
      });

      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const { contenido, idPublicacion } = request.body;

      if (!contenido || !idPublicacion) {
        throw new AppError("contenido e idPublicacion son requeridos.", 400);
      }

      if (!request.authUserId) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const result = await comentariosService.create({
        contenido: String(contenido),
        idUsuario: request.authUserId,
        idPublicacion: parsePositiveInt(idPublicacion, "idPublicacion"),
      });

      return response.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parsePositiveInt(request.params.id, "id");

      if (!request.authUserId) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: request.authUserId },
        select: { rol: true },
      });

      const isDueno = usuario?.rol === RolUsuario.DUENO;

      const result = await comentariosService.remove(
        id,
        request.authUserId,
        isDueno,
      );

      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },
};
