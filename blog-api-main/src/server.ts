import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Blog API escuchando en el puerto ${env.port}`);
});
