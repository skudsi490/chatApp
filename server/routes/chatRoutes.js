const express = require("express");
const {
  fetchOrCreateChat,
  fetchAllChats,
  fetchChatById,
  deleteChat,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroupChat,
  fetchMessages,
  postMessage,
  fetchAllMembers
} = require("../controllers/chat.controller");

const { verifyUserAuthentication } = require("../middleware/authentication");

const router = express.Router();

router.route("/").post(verifyUserAuthentication, fetchOrCreateChat);
router.route("/").get(verifyUserAuthentication, fetchAllChats);
router.get("/:chatId", verifyUserAuthentication, fetchChatById);
router.delete("/:chatId", verifyUserAuthentication, deleteChat);
router.route("/group").post(verifyUserAuthentication, createGroupChat);
router.route("/rename").put(verifyUserAuthentication, renameGroupChat);
router.route("/groupremove").put(verifyUserAuthentication, removeFromGroup);
router.route("/groupadd").put(verifyUserAuthentication, addToGroup);
router.get("/members", verifyUserAuthentication, fetchAllMembers);

// Routes for messages
router.get("/:chatId/messages", verifyUserAuthentication, fetchMessages);
router.post("/:chatId/messages", verifyUserAuthentication, postMessage);

module.exports = router;
