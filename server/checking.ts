import express from "express";
import { SafeParseError, z } from "zod";

const app = express();

app.use(express.json());

/**
 * Validates the request body and query parameters using the provided schemas.
 *
 * @param {z.ZodSchema<TBody>} bodySchema - The schema to validate the request body.
 * @param {z.ZodSchema<TQuery>} querySchema - The schema to validate the query parameters.
 * @param {express.Request<any, any, TBody, TQuery>} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next function.
 * @return {void}
 */
const validate =
  <TBody = any, TQuery = any>(
    bodySchema?: z.ZodSchema<TBody> | null,
    querySchema?: z.ZodSchema<TQuery> | null,
  ) =>
  (
    req: express.Request<any, any, TBody, TQuery>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const bodyResult = bodySchema ? bodySchema.safeParse(req.body) : { success: true };
    const queryResult = querySchema ? querySchema.safeParse(req.query) : { success: true };

    const isBodyError = (result: any): result is SafeParseError<TBody> => !result.success;
    const isQueryError = (result: any): result is SafeParseError<TQuery> => !result.success;

    if (isBodyError(bodyResult) || isQueryError(queryResult)) {
      const errors: unknown[] = [];

      if (isBodyError(bodyResult)) {
        const bodyErrors = bodyResult.error.errors.map((err) => ({
          path: `body.${err.path.join(".")}`,
          message: err.message,
        }));
        errors.push(...bodyErrors);
      }

      if (isQueryError(queryResult)) {
        const queryErrors = queryResult.error.errors.map((err) => ({
          path: `query.${err.path.join(".")}`,
          message: err.message,
        }));
        errors.push(...queryErrors);
      }
      return next(new ApiError(422, "Validation Error", errors));
    }

    next();
  };

// validate body
app.post(
  "/test2",
  validate(
    z.object({
      username: z.string(),
      password: z.string(),
      name: z.string().optional(),
    }),
  ),
  (req, res) => {
    const { name, username, password } = req.body;
    res.json({ name, username, password });
  },
);

// validate query only
app.get(
  "/test3",
  validate(null, z.object({ _id: z.string(), username: z.string() })),
  (req, res) => {
    const { _id, username } = req.query;
    res.json({ _id, username });
  },
);

// validate body and query
app.post(
  "/test4",
  validate(z.object({ name: z.string() }), z.object({ _id: z.string(), username: z.string() })),
  (req, res) => {
    const { name } = req.body;
    const { _id, username } = req.query;
    res.json({ name, _id, username });
  },
);

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string, errors?: any) {
    super(message);
    this.status = status;
  }
}

const errorHandler = (
  err: ApiError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (err instanceof ApiError) {
    res.status(err.status).json(err);
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
};

app.use(errorHandler);

app.listen(7500, () => console.log("Server listening on port 7500"));
