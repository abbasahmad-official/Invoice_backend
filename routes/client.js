import express from "express";
import {create, list, read, update, remove, listClient, listSearch, listCount, listUserCount, listAllClientInvoiceCounts, listClientInvoiceCount} from "../controllers/client.js";
import {protect, adminOnly} from "../middleware/auth.js"
import { clientValidator } from "../validator/clientCreation.js";

const router = express.Router();

router.post("/client/create", protect, clientValidator, create);
router.get("/client/view/:clientId", read);
router.put("/client/update/:clientId", protect, clientValidator, update);
router.delete("/client/remove/:clientId",  remove);
router.get("/clients/user/:userId", protect, listClient);
router.get("/clients/user/count/:userId", protect, listClientInvoiceCount);
router.get("/client/search", listSearch);

// router.get("/clients", protect, list);
router.get("/clients", list);
router.get("/clients/count/:userId", listUserCount)
router.get("/clients/count", listCount);
router.get("/clients/invoices/count", listAllClientInvoiceCounts);



// 

export default router;