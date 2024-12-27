import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("codeDir");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 50 },
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ["c", "py", "go", "cpp", "js"];
    const fileExtension = file.originalname.split(".").pop();
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error("Only .js, .py, .go, and .cpp files are allowed"));
    }
    cb(null, true);
  },
});

export const uploadFile = upload.single("codeFile");
