import { Router } from "express";
import { receiveFile } from "../controllers/codeController.js";
import { uploadFile } from "../utils/multer.js";
var router = Router();

router.post("/upload", uploadFile, receiveFile);

export default router;
