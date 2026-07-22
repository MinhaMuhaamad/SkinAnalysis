import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database.
 * If the connection fails, the process is terminated.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ Critical Error: MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    // Attempt connection
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failure!");
    console.error(`Reason: ${error.message}`);
    
    // Help users troubleshoot Docker status
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Troubleshooting Tip: It looks like the MongoDB container is not running or the port is blocked.");
      console.error("Run 'docker ps' to verify if the container is active, or 'docker compose up -d' to start it.\n");
    } else if (error.message.includes("Authentication failed")) {
      console.error("\n💡 Troubleshooting Tip: Please check that your MONGO_INITDB_ROOT_USERNAME and PASSWORD match the URI credentials.\n");
    }

    // Terminate application if database connection is critical
    process.exit(1);
  }
};

export default connectDB;
