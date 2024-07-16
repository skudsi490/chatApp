const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const verifyUserAuthentication = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("Using JWT_SECRET:", process.env.JWT_SECRET);

      next();
    } catch (error) {
      res
        .status(401)
        .json({ message: "Not authorized, token validation failed" });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
    return;
  }
});

module.exports = { verifyUserAuthentication };
