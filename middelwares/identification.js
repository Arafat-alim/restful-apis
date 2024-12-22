const Jwt = require("jsonwebtoken");

exports.identifier = async (req, res, next) => {
  let token;
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization;
  } else {
    token = req.cookies("Authorization");
  }

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized User" });
  }

  try {
    let userToken = token.split(" ")[1];
    let verifiedJwtToken = await Jwt.verify(
      userToken,
      process.env.TOKEN_SECRET
    );

    if (verifiedJwtToken) {
      req.user = verifiedJwtToken;
      next();
    } else {
      throw new Error("Error in the token");
    }
  } catch (err) {
    console.log("Something went wrong in verfying the user: ", err);
  }
};
