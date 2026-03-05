import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
  try {
    // Use public resolvers so SRV lookups work consistently for Atlas URIs.
    dns.setServers(["1.1.1.1", "8.8.8.8"]);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export default connectDB;