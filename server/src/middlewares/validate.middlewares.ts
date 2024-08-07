import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/response-handler.js";

import { errorHandler } from "./error.middlewares.js";
/**
 *
 * @param {ZodSchema} schema
 *
 * @description This is the validate middleware responsible to centralize the error checking done by the `zod` library.
 * This checks if the request validation has errors.
 * If yes then it structures them and throws an {@link ApiError} which forwards the error to the {@link errorHandler} middleware which throws a uniform response at a single place
 *
 */

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const extractedErrors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return next(new ApiError(422, "Validation Error", extractedErrors));
    }

    next();
  };
