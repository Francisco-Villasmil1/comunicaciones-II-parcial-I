import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middlewares/errorHandler.middleware";
import { apiRouter } from "./routes";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", apiRouter);

app.use((_request, response) => {
  return response.status(404).json({
    message: "Ruta no encontrada.",
  });
});

app.use(errorHandler);
