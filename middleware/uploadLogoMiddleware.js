import upload from "./upload.js"; // your multer config
import multer from "multer";

export const uploadLogo = (req, res, next) => {
  upload.single("logo")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image should be less than 1MB" });
    }
    if (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }
    next();
  });
};

;
