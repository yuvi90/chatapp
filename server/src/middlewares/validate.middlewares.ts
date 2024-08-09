import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/response-handler.js";
import { errorHandler } from "../middlewares/error.middlewares.js";

/**
 * Middleware function for validating request body using the provided schema.
 *
 * @param {ZodSchema<TBody>} schema - The schema to validate the request body.
 * @returns {(req: Request<any, any, TBody>, res: Response, next: NextFunction) => void} - The middleware function.
 * @throws {ApiError} - If the request body validation fails.
 * {@link errorHandler} will catch this error at the central place and it will return an appropriate response to the client
 *
 */
export const validate =
  <TBody>(
    schema: ZodSchema<TBody>,
  ): ((req: Request<any, any, TBody>, res: Response, next: NextFunction) => void) =>
  (req: Request<any, any, TBody>, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const extractedErrors = result.error.errors.map((err) => ({
        [err.path.join(".")]: err.message,
      }));
      next(new ApiError(422, "Validation Error!", extractedErrors));
      return;
    }

    next();
  };
