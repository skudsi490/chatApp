const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/tokenGenerator"); 
const crypto = require("crypto");

const fetchUsers = asyncHandler(async (req, res) => {
  const search = req.query.search ? req.query.search.trim() : '';
  console.log("Search query received:", search);

  if (!search) {
    return res.status(400).json({ message: "No search term provided" });
  }

  const regex = new RegExp(search, 'i'); 
  console.log("Regex used:", regex);

  const query = {
    $or: [
      { fullName: { $regex: regex } },
      { emailAddress: { $regex: regex } }
    ],
    _id: { $ne: req.user._id } 
  };
  console.log("Query constructed:", JSON.stringify(query));

  const users = await User.find(query);
  console.log("Users found:", users);

  if (!users.length) {
    return res.status(404).json({ message: "No users found" });
  }

  res.json(users);
});



const registerNewUser = asyncHandler(async (req, res) => {
  const { fullName, emailAddress, password, profilePicture } = req.body;

  if (!fullName || !emailAddress || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  const userExists = await User.findOne({ emailAddress });
  if (userExists) {
    res.status(400).json({ message: "User already exists." });
    return;
  }

  const user = await User.create({
    fullName,
    emailAddress,
    hashedPassword: password, 
    profilePicture: profilePicture || `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(emailAddress).digest("hex")}?d=identicon`
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      emailAddress: user.emailAddress,
      isAdministrator: user.isAdministrator,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Failed to create user." });
  }
});


const authenticateUser = asyncHandler(async (req, res) => {
  const { emailAddress, password } = req.body;

  console.log(`Attempting to authenticate user: ${emailAddress}`);

  const user = await User.findOne({ emailAddress });
  if (!user) {
    console.log("No user found with that email"); 
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (!(await user.matchPassword(password))) {
    console.log("Password does not match"); 
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    _id: user._id,
    fullName: user.fullName,
    emailAddress: user.emailAddress,
    isAdministrator: user.isAdministrator,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  });
});


module.exports = { fetchUsers, registerNewUser, authenticateUser };
