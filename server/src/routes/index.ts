import { Application } from "express";
import authRoutes from "./v1/auth.routes.js";
import userRoutes from "./v1/user.routes.js";
import adminRoutes from "./v1/admin.routes.js";

export default function routerConfig(app: Application) {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/admin", adminRoutes);
}
