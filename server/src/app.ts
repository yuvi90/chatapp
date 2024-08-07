import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import config from "./config/index.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Express App
const app = express();

// Initializes Middlewares
app.use(morgan("dev"));
app.use(cors(config.corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/test", async (req, res) => {
  try {
    res.send("Hello World!");
  } catch (error) {
    console.log(error);
  }
});

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Error Middleware
app.use(errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
