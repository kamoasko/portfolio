import mongoose from "mongoose";
import { config } from "./environment";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: config.mongodbDatabase,
    });

    console.log("✓ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log("✓ MongoDB disconnected");
  } catch (error) {
    console.error("✗ MongoDB disconnection failed:", error);
  }
}

export default mongoose.connection;
