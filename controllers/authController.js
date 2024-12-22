const jwt = require("jsonwebtoken");
const {
  signupSchema,
  signinSchema,
  acceptCodeSchema,
  changePasswordSchema,
  sendForgotPasswordCodeSchema,
  acceptFPCodeSchema,
} = require("../middelwares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const { generateSecretKey } = require("../utils/generateJwtToken");
const transport = require("../middelwares/sendMail");
const generateVerificationEmail = require("../utils/generateVerificationMail");
const generateEmailTemplate = require("../utils/generateEmailTemplate");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    //! check new user is alreay exisi in the database or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exist!" });
    }

    //! if existing user is not exist then hash the password
    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const result = await newUser.save(); // it will return email and password
    result.password = undefined;
    if (result) {
      res.status(201).json({
        success: true,
        message: "Congratulations! User has been created Successfully",
        result,
      });
    }
  } catch (err) {
    console.log("Something Went Wrong in Auth Controller: ", err);
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  const { error, value } = await signinSchema.validate({ email, password });

  //! validate email and password using validator middleware schema
  if (error) {
    return res
      .status(401)
      .json({ success: false, message: error.details[0].message });
  }

  //! =find user in the database with email, and fetched the email and password if user found
  const exisitingUser = await User.findOne({ email }).select("+password");

  if (!exisitingUser) {
    return res
      .status(404)
      .json({ success: false, message: "User does not exists" });
  }

  const result = await doHashValidation(password, exisitingUser.password); // it will return true or false

  if (!result) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid Credentials" });
  }

  //! generate jwt token
  const token = jwt.sign(
    {
      userId: exisitingUser._id,
      email: exisitingUser.email,
      verified: exisitingUser.verfied,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "8h" }
  );

  res
    .cookie("Authorization", "Bearer " + token, {
      expires: new Date(Date.now() + 8 * 360000),
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
    })
    .json({
      success: true,
      token,
      message: "LoggedIn Successfull",
    });
};

exports.signout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    //! find user in the db
    const exisitingUser = await User.findOne({ email });

    if (!exisitingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists" });
    }

    //! token generated with the help of crypto
    // const token = generateSecretKey(16);
    const token = Math.floor(Math.random() * 1000000).toString();

    const info = await transport.sendMail({
      from: process.env.NODE_SENDING_EMAIL_ADDRESS,
      to: exisitingUser.email,
      subject: "Verification Code",
      html: generateVerificationEmail(token),
    });

    //! handle code sent
    if (info.accepted[0] === exisitingUser.email) {
      //! create hmac process
      const hashedCodeValue = await hmacProcess(
        token,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      exisitingUser.verificationCode = hashedCodeValue;
      exisitingUser.verificationCodeValidation = Date.now();
      await exisitingUser.save();
      return res.status(201).json({ success: true, message: "Code Sent" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Code Sent Failed" });
  } catch (err) {
    console.log("Something went wrong in Send Verification Code: ", err);
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = await acceptCodeSchema.validate({
      email,
      providedCode,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }

    if (existingUser.verfied) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong with the code",
      });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Code has been expired!" });
    }

    const hashedCodeValue = await hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verfied = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: "Your account has been verified successfully!",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unexpected occured!",
    });
  } catch (err) {
    console.log("Something Went Wrong in Verifying Verification Code: ", err);
  }
};

exports.changePassword = async (req, res) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const { error, value } = await changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    //! Optional
    if (!verified) {
      return res.status(401).json({
        message: "You are not verified yet, please verify your email Id first!",
      });
    }

    //! find user
    const existingUser = await User.findOne({ _id: userId }).select(
      "+password"
    );
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }

    const result = await doHashValidation(oldPassword, existingUser.password);

    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const hashedNewPassword = await doHash(oldPassword, 12);
    existingUser.password = hashedNewPassword;
    await existingUser.save();
    return res.status(200).json({
      success: true,
      message: "Congratulations! Password Updated Successfully!",
    });
  } catch (err) {
    console.log("Something went wrong with the forgot password api: ", err);
  }
};

exports.sendforgotPasswordCode = async (req, res) => {
  const { email } = req.body;

  try {
    const { error, value } = await sendForgotPasswordCodeSchema.validate({
      email,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exisis!" });
    }

    const codeValue = Math.floor(Math.random() * 5 * 100000).toString();
    const info = await transport.sendMail({
      from: process.env.NODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Reset Your Password",
      html: generateEmailTemplate({
        subject: "Reset Your Password",
        headerText: "Password Reset Request",
        bodyText:
          "It seems like you requested a password reset. Please use the verification code below to complete the process.",
        actionText: null,
        actionUrl: null,
        verificationCode: `${codeValue}`,
      }),
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: `Reset Code has been sent! Please check your email ${existingUser.email}`,
      });
    }
  } catch (err) {
    console.log("Something went wrong with Forgot password API: ", err);
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;

  try {
    const { error, value } = await acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    console.log(existingUser);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exisit" });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "something is wrong with the code" });
    }

    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Code has been expired!" });
    }

    const codeValue = providedCode.toString();
    const hashedCode = await hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCode === existingUser.forgotPasswordCode) {
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res.status(201).json({
        success: true,
        message: "Password has been reset. Please login!",
      });
    }
    res.status(401).json({
      success: false,
      message: "unexpected occured",
    });
  } catch (err) {
    console.log("Something went wrong with Forgot password API: ", err);
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.user;

  try {
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists!" });
    }
    if (existingUser.deletedUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already deleted" });
    }

    existingUser.deletedUser = true;
    await existingUser.save();
    return res
      .status(200)
      .json({ success: true, message: "User has been deleted successfully" });
  } catch (err) {
    console.log("Somethign went wrong with Delete User API: ", err);
  }
};
