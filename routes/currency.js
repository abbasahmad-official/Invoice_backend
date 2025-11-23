import express from "express"
import {list, update} from "../controllers/currency.js";

const router  = express.Router()

router.get("/currencies", list)
router.put("/currency/:currencyId/user/:userId", update)

export default router