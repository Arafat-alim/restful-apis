const crypto = require("crypto");

exports.generateSecretKey = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};
