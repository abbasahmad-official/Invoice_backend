import express from "express";
import {create, list, read, update, remove, listProduct, listSearch} from "../controllers/product.js";
import {protect, adminOnly} from "../middleware/auth.js";

const router = express.Router();

router.post("/product/create", protect, create);
router.get("/product/view/:productId", read);
router.put("/product/update/:productId", protect, update);
router.delete("/product/remove/:productId", protect, remove);
router.get("/products/user/:userId", protect, listProduct);
router.get("/product/search", listSearch);

// router.get("/products", protect, list);
router.get("/products", list);

export default router;