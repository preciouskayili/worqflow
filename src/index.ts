import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import router from "./routes";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import { createLogger, format, transports } from "winston";

dotenv.config();

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.json(),
    format.timestamp(),
    format.colorize(),
    format.printf(
      (info) =>
        `${info.timestamp} ${info.level} ${info.message} ${info.stack}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// Initialize Express app
const apiVersion = process.env.API_VERSION || "v1";

// Middleware
const app = express();

app.use(helmet());
app.use(morgan("dev", { stream: { write: (message) => logger.info(message) } }));
app.enable("trust proxy");
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN!],
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  })
);

// Middleware: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Apply rate limiting and API routes
app.use(`/${apiVersion}/`, apiLimiter, router);

// 404 Handler
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ message: "Endpoint Not Found" });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack);
  if (!res.headersSent) {
    // Prevent sending headers if already sent
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the Express server
const APP_PORT = process.env.APP_PORT || 8000;

app.listen(APP_PORT, () => {
  logger.info(`Express server listening on port ${APP_PORT}`);
});
