import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "localhost",

  // Database
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio",
  mongodbDatabase: process.env.MONGODB_DATABASE || "portfolio",

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",

  // CORS
  corsOrigin: (
    process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000"
  ).split(","),

  // Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  fromEmail: process.env.FROM_EMAIL,

  // Admin
  adminEmail: process.env.ADMIN_EMAIL || "admin@kamrandev.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",

  // Telemetry
  telemetryEnabled: process.env.TELEMETRY_ENABLED === "true",
  telemetryExportInterval: parseInt(
    process.env.TELEMETRY_EXPORT_INTERVAL || "5000",
    10,
  ),
};
