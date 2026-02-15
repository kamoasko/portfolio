import dotenv from "dotenv";
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  // Default to local, but prioritize env var
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio",
  jwtSecret: process.env.JWT_SECRET || "default_secret_please_change",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
  
  // FIX: Split the comma-separated string into an actual array
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ["http://localhost:5173", "http://localhost:3000"],
    
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  telemetryEnabled: process.env.TELEMETRY_ENABLED === "true",
};