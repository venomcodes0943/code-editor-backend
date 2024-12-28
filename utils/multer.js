import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "tmp");
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["c", "py", "go", "cpp"];

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      await fs.promises.mkdir(UPLOAD_DIR, {
        recursive: true,
        mode: 0o750,
      });

      const stats = await fs.promises.stat(UPLOAD_DIR);
      if (stats.mode & 0o007) {
        await fs.promises.chmod(UPLOAD_DIR, 0o750);
      }
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(new Error("Failed to setup upload directory"));
    }
  },
  filename: function (req, file, cb) {
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const sanitizedOriginalname = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${randomBytes}-${sanitizedOriginalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return cb(
        new Error(
          `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`
        )
      );
    }
    cb(null, true);
  },
});

export const uploadFile = upload.single("codeFile");

export const scheduleFileRemove = (filePath, delay = 5 * 60 * 1000) => {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });
    }
  }, delay);
};
