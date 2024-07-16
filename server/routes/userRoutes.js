const express = require("express");
const {
  fetchUsers,
  registerNewUser,
  authenticateUser,
} = require("../controllers/user.controller"); 
const { verifyUserAuthentication } = require("../middleware/authentication"); 

const router = express.Router();

router.get("/", verifyUserAuthentication, fetchUsers);

router.post("/register", registerNewUser);

router.post("/login", authenticateUser);


module.exports = router;
