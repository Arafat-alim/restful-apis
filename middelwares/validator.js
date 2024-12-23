const Joi = require("joi");

exports.signupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: Joi.string().min(4).max(20).alphanum().required(),
});

exports.signinSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: Joi.string().min(4).max(20).required(),
});

exports.acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  providedCode: Joi.number().required(),
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(4).max(20).alphanum().required(),
  newPassword: Joi.string().min(4).max(20).alphanum().required(),
});

exports.sendForgotPasswordCodeSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
});

exports.acceptFPCodeSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(50)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: Joi.string().required(),
  newPassword: Joi.string().min(5).max(20).alphanum().required(),
});

exports.createPostSchema = Joi.object({
  title: Joi.string().min(4).max(40).required(),
  description: Joi.string().min(5).max(200).required(),
  userId: Joi.string().required(),
});
