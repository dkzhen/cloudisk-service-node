import express from "express";
import { upload, handleMulterError } from "../middlewares/upload.middleware.js";
import {
    uploadFile,
    deleteFile,
    listFiles,
} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload", upload.single("file"), handleMulterError, uploadFile);
router.delete("/:filename", deleteFile);
router.get("/", listFiles);

export default router;
