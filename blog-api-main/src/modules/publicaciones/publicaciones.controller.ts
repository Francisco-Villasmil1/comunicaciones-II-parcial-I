import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/appError";
import { parsePositiveInt } from "../../shared/parsePositiveInt";
import { publicacionesService } from "./publicaciones.service";

const parseImagenes = (value: unknown) => {
  if (value == null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new AppError("imagenes debe ser un arreglo.", 400);
  }

  return value.map((imagen, index) => {
    if (!imagen || typeof imagen !== "object") {
      throw new AppError(`Imagen invalida en posicion ${index}.`, 400);
    }

    const url = "url" in imagen ? String(imagen.url ?? "") : "";

    if (!url.trim()) {
      throw new AppError(`La url es requerida en imagen ${index + 1}.`, 400);
    }

    return {
      url,
      descripcion:
        "descripcion" in imagen && imagen.descripcion
          ? String(imagen.descripcion)
          : undefined,
    };
  });
};

export const publicacionesController = {
  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const page = parsePositiveInt(request.query.page, "page", 1);
      const limit = parsePositiveInt(request.query.limit, "limit", 10);

      let titulo: string | undefined;
      if (request.query.titulo && request.query.titulo !== "") {
        titulo = String(request.query.titulo);
      }

      const result = await publicacionesService.list({ page, limit, titulo });
      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async getById(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parsePositiveInt(request.params.id, "id");
      const result = await publicacionesService.getById(id);
      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const { titulo, contenido, imagenes } = request.body;

      if (!titulo) {
        throw new AppError("titulo es requerido.", 400);
      }

      if (!request.authUserId) {
        throw new AppError("Usuario no autenticado.", 401);
      }

      const result = await publicacionesService.create({
        titulo: String(titulo),
        contenido: contenido ? String(contenido) : undefined,
        idAutor: request.authUserId,
        imagenes: parseImagenes(imagenes),
      });

      return response.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parsePositiveInt(request.params.id, "id");
      const { titulo, contenido, imagenes } = request.body;

      if (!titulo) {
        throw new AppError("titulo es requerido.", 400);
      }

      const result = await publicacionesService.update(id, {
        titulo: String(titulo),
        contenido: contenido ? String(contenido) : undefined,
        imagenes: parseImagenes(imagenes),
      });

      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async addImagen(request: Request, response: Response, next: NextFunction) {
    try {
      const publicacionId = parsePositiveInt(request.params.id, "id");
      const { url, descripcion } = request.body;

      if (!url) {
        throw new AppError("url es requerida.", 400);
      }

      const result = await publicacionesService.addImagen(publicacionId, {
        url: String(url),
        descripcion: descripcion ? String(descripcion) : undefined,
      });

      return response.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  async removeImagen(request: Request, response: Response, next: NextFunction) {
    try {
      const publicacionId = parsePositiveInt(
        request.params.publicacionId,
        "publicacionId",
      );
      const imagenId = parsePositiveInt(request.params.imagenId, "imagenId");

      const result = await publicacionesService.removeImagen(
        publicacionId,
        imagenId,
      );

      return response.json(result);
    } catch (error) {
      return next(error);
    }
  },
};
