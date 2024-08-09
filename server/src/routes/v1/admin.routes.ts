import express from "express";
import AdminController from "@/controllers/v1/admin.controller.js";
import { adminOnly, authenticate } from "@/middlewares/auth.middlewares.js";
import { ChangeRoleSchema } from "@/validators/admin.validators.js";
import { validate } from "@/middlewares/validate.middlewares.js";

const router = express.Router();

router.get("/users", authenticate, adminOnly, AdminController.getAllUsers);

router.patch(
  "/assign-role",
  authenticate,
  adminOnly,
  validate(ChangeRoleSchema),
  AdminController.changeUserRole,
);

export default router;
