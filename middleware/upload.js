import multer from "multer";
import path from "path";
import fs from "fs"
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "uploads")
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null,`${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}` )
    }
})

const upload = multer({storage})

export default upload