import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { config } from "../config/app.config.js";
import { getFolderSize } from "../utils/storage.util.js";

// Mutex sederhana untuk prevent race condition pada storage check
let uploadLock = Promise.resolve();

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        let currentPath = req.file.path;
        let finalFilename = req.file.filename;
        let finalSize = req.file.size;

        // Image optimization logic dengan error handling
        if (req.file.mimetype.startsWith("image/")) {
            try {
                const optimizedFilename = `${req.file.filename.split(".")[0]}.${config.image.format}`;
                const optimizedPath = path.join(config.storage.path, optimizedFilename);
                
                await sharp(currentPath)
                    .resize(config.image.maxWidth, config.image.maxHeight, {
                        fit: "inside",
                        withoutEnlargement: true,
                    })
                    .webp({ quality: config.image.quality })
                    .toFile(optimizedPath);

                // Hapus file asli
                await fs.unlink(currentPath);
                
                // Update info
                currentPath = optimizedPath;
                finalFilename = optimizedFilename;
                const stat = await fs.stat(optimizedPath);
                finalSize = stat.size;
            } catch (sharpError) {
                // Jika sharp gagal (corrupt image), tetap simpan file asli
                console.error("Sharp optimization failed:", sharpError.message);
                // File asli tetap ada di currentPath, lanjutkan dengan file asli
            }
        }

        // Storage check dengan lock untuk prevent race condition
        await uploadLock;
        uploadLock = (async () => {
            const currentSize = await getFolderSize(config.storage.path);

            if (currentSize + finalSize > config.storage.maxSize) {
                // Hapus file jika storage penuh
                await fs.unlink(currentPath).catch(() => {});

                throw new Error(`Storage penuh (max ${config.storage.maxSize / 1024 / 1024 / 1024}GB)`);
            }
        })();

        await uploadLock;

        return res.json({
            filename: finalFilename,
            url: `/files/${finalFilename}`,
            size: finalSize,
        });
    } catch (err) {
        // Cleanup file if error occurs
        if (req.file && req.file.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        
        // Cleanup optimized file if exists
        if (req.file && req.file.filename) {
            const optimizedPath = path.join(
                config.storage.path, 
                `${req.file.filename.split(".")[0]}.${config.image.format}`
            );
            await fs.unlink(optimizedPath).catch(() => {});
        }

        return res.status(err.message.includes("Storage penuh") ? 400 : 500).json({ 
            message: err.message 
        });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { filename } = req.params;

        // SECURITY: Prevent path traversal attack
        const sanitizedFilename = path.basename(filename);
        if (sanitizedFilename !== filename) {
            return res.status(400).json({ 
                message: "Invalid filename" 
            });
        }

        const filePath = path.join(config.storage.path, sanitizedFilename);

        // Pastikan file ada di dalam storage path (double check)
        const resolvedPath = path.resolve(filePath);
        const resolvedStorage = path.resolve(config.storage.path);
        
        if (!resolvedPath.startsWith(resolvedStorage)) {
            return res.status(400).json({ 
                message: "Invalid file path" 
            });
        }

        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ message: "File tidak ditemukan" });
        }

        await fs.unlink(filePath);

        return res.json({
            message: "File berhasil dihapus",
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const listFiles = async (req, res) => {
    try {
        const files = await fs.readdir(config.storage.path).catch(() => []);

        const result = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(config.storage.path, file);
                try {
                    const stat = await fs.stat(filePath);
                    
                    // Skip directories, hanya return files
                    if (!stat.isFile()) {
                        return null;
                    }

                    return {
                        filename: file,
                        url: `/files/${file}`,
                        size: stat.size,
                        createdAt: stat.birthtime,
                    };
                } catch {
                    return null;
                }
            })
        );

        const filteredResult = result.filter((f) => f !== null);

        return res.json({
            total: filteredResult.length,
            files: filteredResult,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
