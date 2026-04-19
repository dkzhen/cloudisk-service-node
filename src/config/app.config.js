import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || "development",
    
    // Storage configuration
    storage: {
        path: "storage",
        maxSize: 5 * 1024 * 1024 * 1024, // 5GB
        maxFileSize: 50 * 1024 * 1024, // 50MB
    },

    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // max requests per IP
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    },

    // Image optimization
    image: {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 80,
        format: "webp",
    },
};
