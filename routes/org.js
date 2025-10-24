import express from "express";
import {update, remove, create, list,  active, suspended} from "../controllers/org.js"
import {protect, adminOnly} from "../middleware/auth.js"

const router = express.Router();

router.post("/org/create", protect, create);
router.get("/orgs", protect, list);
router.get("/org/active", protect, active);
router.get("/org/suspended", protect, suspended);
router.delete("/org/remove/:orgId", remove);
router.put("/org/update/:orgId", update);
// router.get("/client/view/:clientId", read);
// router.put("/client/update/:clientId", protect, update);
// router.delete("/client/remove/:clientId",  remove);
// router.get("/clients/user/:userId", protect, listClient);
// router.get("/client/search", listSearch);

// router.get("/clients", list);
// router.get("/clients/count/:userId", listUserCount)
// router.get("/clients/count", listCount);





export default router;