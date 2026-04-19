import app from "./src/app.js";
import { config } from "./src/config/app.config.js";

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 CloudDisk File Service running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${config.env}`);
    console.log(`💾 Storage path: ${config.storage.path}`);
    console.log(`📊 Max storage: ${config.storage.maxSize / 1024 / 1024 / 1024}GB`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("SIGINT signal received: closing HTTP server");
    process.exit(0);
});
