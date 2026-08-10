import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { comentariosController } from "./comentarios.controller";

export const comentariosRouter = Router();

comentariosRouter.get("/", comentariosController.list);
comentariosRouter.post("/", requireAuth, comentariosController.create);
comentariosRouter.delete("/:id", requireAuth, comentariosController.remove);
