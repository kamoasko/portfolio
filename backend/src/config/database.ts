import mongoose from "mongoose";
import { config } from "./environment";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: config.mongodbDatabase,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log("✓ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    console.error("   Please ensure MongoDB is running or update MONGODB_URI in .env");
    console.error("   You can use MongoDB Atlas free tier: https://www.mongodb.com/cloud/atlas");
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
