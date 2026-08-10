import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireDueno } from "../../middlewares/requireDueno.middleware";
import { publicacionesController } from "./publicaciones.controller";

export const publicacionesRouter = Router();

publicacionesRouter.get("/", publicacionesController.list);
publicacionesRouter.get("/:id", publicacionesController.getById);
publicacionesRouter.post(
  "/",
  requireAuth,
  requireDueno,
  publicacionesController.create,
);
publicacionesRouter.patch(
  "/:id",
  requireAuth,
  requireDueno,
  publicacionesController.update,
);
publicacionesRouter.post(
  "/:id/imagenes",
  requireAuth,
  requireDueno,
  publicacionesController.addImagen,
);
publicacionesRouter.delete(
  "/:publicacionId/imagenes/:imagenId",
  requireAuth,
  requireDueno,
  publicacionesController.removeImagen,
);
