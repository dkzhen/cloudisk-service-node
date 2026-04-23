import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/app.config.js";
import { ALLOWED_MIME_TYPES } from "../constants/file-types.constant.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.storage.path);
    },
    filename: (req, file, cb) => {
        // Sanitize original filename - remove path traversal attempts
        const sanitized = path
            .basename(file.originalname)
            .replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, `${uuidv4()}-${sanitized}`);
    },
});

// File filter untuk validasi
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else if (
        file.mimetype === "application/octet-stream" &&
        file.originalname.toLowerCase().endsWith(".apk")
    ) {
        // APK sering terdeteksi sebagai octet-stream oleh beberapa client/browser
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: config.storage.maxFileSize,
    },
    fileFilter,
});

// Error handler middleware untuk multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: `File terlalu besar (max ${config.storage.maxFileSize / 1024 / 1024}MB)`,
            });
        }
        return res.status(400).json({
            message: `Upload error: ${err.message}`,
        });
    } else if (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
    next();
};
