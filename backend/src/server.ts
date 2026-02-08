import { config } from "./config/environment";
import createApp from "./app";

async function startServer() {
  try {
    const app = await createApp();

    const server = app.listen(config.port, config.host, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║   KamranDev Portfolio Backend Server                   ║
║   Running at: http://${config.host}:${config.port}                    ║
║   Environment: ${config.nodeEnv.padEnd(35)}║
╚════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
