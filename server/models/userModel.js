const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    emailAddress: { type: String, unique: true, required: true },
    hashedPassword: { type: String, required: true },
    profilePicture: { type: String, required: true, default: () => `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(this.emailAddress).digest("hex")}?d=identicon` },
    isAdministrator: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.hashedPassword);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
  next();
});

const UserModel = mongoose.model("User", userSchema, "users");

module.exports = UserModel;
