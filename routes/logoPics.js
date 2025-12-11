import express from "express"
import {protect} from "../middleware/auth.js"
import upload from "../middleware/upload.js"
import {uploadLogo} from "../middleware/uploadLogoMiddleware.js"
import {create, remove, getLogo, logoMiddleware, logo} from "../controllers/file.js" 
import { checkFeature } from "../middleware/cheackFeature.js"

const router = express.Router()


router.post("/upload",protect ,uploadLogo, create)
router.get("/logo/pic/:orgId",protect ,logoMiddleware , logo)
router.delete("/logo/remove",protect , remove)
router.get("/logo/get",protect , getLogo)





export default router

