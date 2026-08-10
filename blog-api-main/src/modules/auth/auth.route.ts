import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.get("/can-register", authController.canRegister);
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", requireAuth, authController.me);
