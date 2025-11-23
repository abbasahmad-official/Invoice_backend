import express from "express";
import {downloadPDF, downloadPDFPublic, downloadPdfTemplate} from "../controllers/pdf.js"
import {protect, adminOnly} from "../middleware/auth.js";
const router = express.Router();

router.post("/generate-pdf", protect, downloadPDF);
router.post("/generate-pdf/public", downloadPDFPublic);
router.post("/generate-pdf/template", downloadPdfTemplate);

export default router;
