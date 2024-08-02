import { config as env } from "dotenv";
env();

const allowedOrigins = [
  "https://www.yoursite.com",
  "http://localhost:5173",
  "http://192.168.0.150:5173",
];
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export default {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.TOKEN_SECRET || "",
  jwtRefreshSecret: process.env.REFRESH_TOKEN_SECRET || "",
  jwtTokenExpiry: process.env.TOKEN_EXPIRY || "",
  jwtRefreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "",
  mongoURI: process.env.MONGO_URI || "",
  corsOptions,
};
