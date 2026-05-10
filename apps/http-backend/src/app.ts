import express, { Express } from "express";
import cors from "cors";
import { router } from "./routes/index.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { registerEventListeners } from "./events/eventListeners.js";
import { eventBus } from "./events/eventBus.js";
import { mailService } from "./infrastructure/mail/mail.container.js";

registerEventListeners({
  eventBus,
  mailService,
  config: { BACKEND_URL: process.env.BACKEND_URL! },
});

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.use((req, res) => {
  res
    .status(404)
    .json({ status: "fail", message: `Can't find route ${req.originalUrl}` });
});

app.use(globalErrorHandler);

export { app };
