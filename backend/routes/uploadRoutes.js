import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpe?g|png|webp/;
  const allowedMime = /image\/jpe?g|image\/png|image\/webp/;

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExt.test(ext) && allowedMime.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post("/", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      image: `/uploads/${path.basename(req.file.path)}`,
    });
  });
});

export default router;
