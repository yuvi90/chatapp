import { errorHandler } from "../middlewares/error.middlewares.js";

/**
 *
 * @description Common Error class to throw an error from anywhere.
 * The {@link errorHandler} middleware will catch this error at the central place and it will return an appropriate response to the client
 *
 */

class ApiError extends Error {
  statusCode: number;
  status: boolean;
  data: null;
  errors: unknown[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong !",
    errors: unknown[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = false;
    this.data = null;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 *
 * @description Common Response class to return an appropriate response to the client
 *
 */

class ApiResponse {
  public statusCode: number;
  public status: boolean;
  public message: string;
  public data?: unknown | undefined;

  constructor(
    statusCode: number,
    message: string = "success",
    data?: unknown | undefined
  ) {
    this.statusCode = statusCode;
    this.status = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export { ApiError, ApiResponse };
