import { Router } from "express";

import { authRouter } from "../modules/auth/auth.route";
import { comentariosRouter } from "../modules/comentarios/comentarios.route";
import { publicacionesRouter } from "../modules/publicaciones/publicaciones.route";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  return response.json({ status: "ok", service: "blog-api" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/publicaciones", publicacionesRouter);
apiRouter.use("/comentarios", comentariosRouter);
