import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";

import { AppError } from "../shared/appError";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return response.status(400).json({
      message: "Error de persistencia en base de datos.",
      code: error.code,
      details: error.meta ?? null,
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return response.status(400).json({
      message: "Error de validacion de datos.",
      details: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return response.status(400).json({
      message: "Error desconocido al procesar la consulta de base de datos.",
      details: error.message,
    });
  }

  return response.status(500).json({
    message: "Error interno del servidor.",
  });
};
