import multer from "multer";

// Memory storage — file is kept in RAM
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // optional: limit to 1MB
});

export default upload;
