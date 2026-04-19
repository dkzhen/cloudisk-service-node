import express from "express";
import cors from "cors";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config/app.config.js";
import fileRoutes from "./routes/file.routes.js";

const app = express();

// Pastikan folder storage ada
if (!fs.existsSync(config.storage.path)) {
    fs.mkdirSync(config.storage.path, { recursive: true });
}

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        message: "Terlalu banyak request, coba lagi nanti",
    },
});

app.use(limiter);

// Serve static files
app.use("/files", express.static(config.storage.path));

// API Routes
app.use("/api/files", fileRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        service: "CloudDisk File Service",
        status: "running",
        version: "1.0.0",
        environment: config.env,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Endpoint not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
    });
});

export default app;
