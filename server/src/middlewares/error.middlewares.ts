import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/response-handler.js";

/**
 *
 * @description A middleware to handle async errors (try-catch wrapper)
 *
 */

type requestType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<unknown, Record<string, unknown>>>;

const tryCatchWrapper = (request: requestType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(request(req, res, next)).catch((err) => next(err));
  };
};

/**
 *
 * @description This middleware is responsible to catch the errors from any request handler wrapped inside the {@link tryCatchWrapper}
 *
 */

const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError;
  if (err instanceof ApiError) {
    error = err;
  } else {
    // if the `error` variable is not an instance of ApiError

    // assign an appropriate status code
    const statusCode =
      err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientUnknownRequestError
        ? 400
        : 500;

    // set a message from native Error instance or a custom one
    const message = err.message || "Something went wrong !";

    // create a new ApiError instance to keep the consistency
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    success: error.status,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  // Log error
  console.log(error);

  // Send error response
  return res.status(error.statusCode).json(response);
};

export { tryCatchWrapper, errorHandler };
