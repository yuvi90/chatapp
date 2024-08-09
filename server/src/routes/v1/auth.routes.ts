import express from "express";
import AuthController from "@/controllers/v1/auth.controllers.js";
import { LoginSchema, RegisterSchema } from "@/validators/auth.validators.js";
import { validate } from "@/middlewares/validate.middlewares.js";

const router = express.Router();

router.post("/register", validate(RegisterSchema), AuthController.registerUser);

router.post("/login", validate(LoginSchema), AuthController.loginUser);

router.get("/logout", AuthController.logoutUser);

router.get("/refresh", AuthController.refreshAccessToken);

export default router;
