import express from "express";
import {signin, signout, signup} from "../controllers/auth.js";
import {userSignupValidator} from "../validator/userSignup.js";
import {protect, adminOnly } from "../middleware/auth.js";

// const {userSignupValidator} = require("../validator/userSignup")
const router = express.Router();

// const {signin, signup, signout} = require("../controllers/auth")


router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.post("/signout",protect, signout);

export default router;