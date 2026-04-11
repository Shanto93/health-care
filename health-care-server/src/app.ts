import cookieParser from "cookie-parser"; // 1. Import cookie parser
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";
import config from "./config";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  }),
);

// 2. Initialize cookie parser before your routes
app.use(cookieParser());

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Server is running ...",
    Time: new Date().toLocaleTimeString(),
    UpTime: process.uptime().toFixed(2) + " seconds",
    Environment: config.node_env,
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
