import express from "express"
import {protect} from "../middleware/auth.js"
import upload from "../middleware/upload.js"
import {create, remove, getLogo} from "../controllers/file.js" 

const router = express.Router()


router.post("/upload",protect ,upload.single("logo"), create)
router.delete("/logo/remove",protect , remove)
router.get("/logo/get",protect , getLogo)





export default router

