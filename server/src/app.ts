import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { errorHandler } from "./middlewares/error.middlewares.js";
import config from "./config/index.js";

// Routes
import routerConfig from "./routes/index.js";

// Express App
const app = express();

// Initializes Middlewares
app.use(morgan("dev"));
app.use(cors(config.corsOptions));
app.use(express.json());
app.use(cookieParser());

// Initializes Routes
routerConfig(app);

// Error Middleware
app.use(errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
