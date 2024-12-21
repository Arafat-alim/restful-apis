const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      unique: [true, "Email should must be unique"],
      minLength: [5, "Character should be greater than 5."],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password must be required!"],
      trim: true,
      select: false,

      minLen: [5, "Password must be greater than 5 characters."],
    },
    verfied: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
