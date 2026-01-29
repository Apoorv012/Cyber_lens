import express from "express";
import cors from "cors";
import resolveOwner from "./utils/resolveOwner";
import {
  authenticateUser,
  authenticateUserOptional,
} from "./middleware/authenticateUser";
import { requireVerifiedEmail } from "./middleware/requireVerifiedEmail";
import resolveRuntimeOwner from "./middleware/resolveRuntimeOwner";
import newsRouter from "./routes/news";
import lookupRouter from "./routes/lookup";
import historyRouter from "./routes/history";
import authRouter from "./routes/auth";
import analyticsRouter from "./routes/analytics";
import router from "./routes";
import { runNewsScraper } from "./services/newsScraper";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;

if (!corsOrigin) {
  throw new Error("CORS_ORIGIN must be set in environment");
}

app.use(express.json());

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Client-ID", "Authorization"],
  }),
);

app.use(resolveOwner);
app.use(authenticateUserOptional);
app.use(resolveRuntimeOwner);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// Protected routes: require a valid JWT
app.use("/analytics", authenticateUser, requireVerifiedEmail, analyticsRouter);
app.use("/", router);
app.use("/news", newsRouter);
app.use("/lookup", lookupRouter);
app.use("/history", historyRouter);
app.use("/auth", authRouter);

export default app;
