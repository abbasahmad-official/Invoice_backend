import express from "express";
import {listByStatus, listCount, listManagers, update, removeManager} from "../controllers/user.js"
import {protect, adminOnly} from "../middleware/auth.js";

const router = express.Router();

// router.post("/product/create", protect, create);
// router.get("/product/view/:productId", protect, read);
// router.put("/product/update/:productId", protect, update);
// router.delete("/product/remove/:productId", protect, remove);
// router.get("/products/:userId", protect, listProduct);
// router.get("/product/search", listSearch);

// router.get("/products", protect, list);
router.get("/users/count", listCount);
router.post("/user/update", update);
router.get("/managers", listManagers);
router.delete("/manager/remove/:managerId", protect, removeManager);
router.get("/managers/status/:status", protect, listByStatus);

export default router;