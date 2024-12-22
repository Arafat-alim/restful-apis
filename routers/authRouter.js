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

router.patch("/change-password", identifier, authController.changePassword);
router.patch(
  "/send-forgot-password-code",
  authController.sendforgotPasswordCode
);

router.patch(
  "/verify-forgot-password-code",
  authController.verifyForgotPasswordCode
);

router.delete("/delete-user", identifier, authController.deleteUser);
router.get("/get-all-users", identifier, authController.getAllNonDeleteUsers);

module.exports = router;
