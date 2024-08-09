import express from "express";
import UserController from "../../controllers/v1/user.controllers.js";
import { adminOnly, authenticate } from "../../middlewares/auth.middlewares.js";

const router = express.Router();

// Route - /api/admin/users
router.get("/users", authenticate, adminOnly, UserController.getAllUsers);

export default router;
