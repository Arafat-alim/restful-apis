const express = require("express");
const authController = require("../controllers/authController");
const { identifier } = require("../middelwares/identification");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signIn);
router.post("/signout", identifier, authController.signout);

router.patch(
  "/send-verification-code",
  identifier,
  authController.sendVerificationCode
);
router.patch(
  "/verify-verification-code",
  identifier,
  authController.verifyVerificationCode
);

module.exports = router;
