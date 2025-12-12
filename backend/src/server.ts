import dotenv from "dotenv";
dotenv.config(); // load .env first

import app from "./app";
import { connectDB } from "./config/db";

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    let currentPort = DEFAULT_PORT;

    const listenOnPort = (port: number) => {
      const server = app.listen(port, () => {
        console.log(`🚀 NextStep backend running on http://localhost:${port}`);
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.warn(
            `⚠️  Port ${port} is already in use. Trying port ${port + 1}...`
          );
          listenOnPort(port + 1);
        } else {
          console.error("❌ Server error:", err);
          process.exit(1);
        }
      });
    };

    listenOnPort(currentPort);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
