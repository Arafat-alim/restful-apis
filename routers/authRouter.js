const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signIn);
router.post("/signout", authController.signout);

router.patch("/send-verification-code", authController.sendVerificationCode);

module.exports = router;
