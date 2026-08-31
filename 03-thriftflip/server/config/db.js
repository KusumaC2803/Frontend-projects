import mongoose from "mongoose";
import dns from "node:dns";

// Use reliable public DNS servers for Node.js SRV lookups
dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is missing in server/.env"
      );
    }

    console.log("Connecting to MongoDB Atlas...");

    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    console.log(
      `Database: ${connection.connection.name}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
}