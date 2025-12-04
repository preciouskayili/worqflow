import cors from "cors";
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import router from "./routes";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";
import { env } from "./config/env";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cron from "node-cron";
import { IntegrationModel } from "./models/Integrations";
import { AuthRequest, requireAuth } from "./middleware/auth";
import { makeGitHubRequest } from "./lib/githubapis";
import { getGmailService } from "./lib/googleapis";
import { google } from "googleapis";

dotenv.config();

connectDB();

// Initialize Express app
const apiVersion = env.API_VERSION || "v1";

// Middleware
const app = express();

app.use(helmet());
app.use(
  morgan("dev", { stream: { write: (message) => logger.info(message) } })
);
app.set("trust proxy", 1 /* number of proxies between user and server */);
function shouldCompress(req: any, res: any) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

app.use(compression({ filter: shouldCompress }) as unknown as RequestHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: [env.CLIENT_ORIGIN],
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

app.get("/home", requireAuth, async (req: AuthRequest, res: Response) => {
  // cron.schedule("*/10 * * * * *", () => {
  //   logger.info("Running scheduled task every 10 seconds");
  // });
  const googleIntegrations = await IntegrationModel.find({
    user_id: req.user._id,
    name: "google",
  });
  const githubIntegrations = await IntegrationModel.find({
    user_id: req.user._id,
    name: "github",
  });
  const response = makeGitHubRequest(
    `/notifications`,
    "GET",
    null,
    githubIntegrations[0].access_token
  );

  const service = await getGmailService({
    access_token: googleIntegrations[0].access_token,
    refresh_token: googleIntegrations[0].refresh_token!,
  });

  // Step 1: get message IDs
  const listRes = await service.users.messages.list({
    userId: "me",
    maxResults: 50,
    q: "is:unread",
  });

  const messages = listRes.data.messages || [];

  // Step 2: batch fetch the full messages
  const detailedMessages = await Promise.all(
    messages.map(async (msg) => {
      const full = await service.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From"],
      });
      return {
        id: msg.id,
        snippet: full.data.snippet,
        headers: full.data.payload?.headers,
      };
    })
  );

  console.log(detailedMessages);

  res.status(200).json({ message: "Welcome to the WorqAI API!", response });
});
// Apply rate limiting and API routes
app.use(`/${apiVersion}/`, apiLimiter, router);

// Swagger Documentation
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
const APP_PORT = env.APP_PORT || 8000;

app.listen(APP_PORT, () => {
  logger.info(`Express server listening on port http://localhost:${APP_PORT}`);
  logger.info(`Swagger docs at http://localhost:${APP_PORT}/docs`);
});
