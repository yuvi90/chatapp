import express from "express";
import AuthController from "@/controllers/v1/auth.controllers.js";
import { LoginSchema, RegisterSchema } from "@/validators/auth.validators.js";
import { validate } from "@/middlewares/validate.middlewares.js";

const router = express.Router();

// Route - /auth/register
router.post("/register", validate(RegisterSchema), AuthController.registerUser);

// Route - /auth/login
router.post("/login", validate(LoginSchema), AuthController.loginUser);

// Route - /auth/logout
router.get("/logout", AuthController.logoutUser);

// Route - /auth/refresh
router.get("/refresh", AuthController.refreshAccessToken);

export default router;
