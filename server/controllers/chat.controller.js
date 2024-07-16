const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// Fetch or create a one-on-one chat
const fetchOrCreateChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID must be provided" });
  }

  let chat = await Chat.findOne({
    isGroup: false,
    members: { $all: [req.user._id, userId] }
  })
  .populate("members", "fullName profilePicture emailAddress")
  .populate("recentMessage");

  if (!chat) {
    const chatData = {
      name: "Direct Chat",
      isGroup: false,
      members: [req.user._id, userId],
    };
    const newChat = await Chat.create(chatData);
    chat = await Chat.findById(newChat._id).populate("members", "fullName profilePicture emailAddress");
  }

  res.status(200).json(chat);
});

// Fetch all user chats
const fetchAllChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate("members", "fullName profilePicture emailAddress")
      .populate("admin", "fullName profilePicture emailAddress")
      .populate("recentMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve chats", error: error.message });
  }
});

const fetchAllMembers = asyncHandler(async (req, res) => {
  try {
    const members = await User.find().select("fullName profilePicture emailAddress");
    res.json(members);
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve members", error: error.message });
  }
});

const fetchChatById = asyncHandler(async (req, res) => {
  try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId)
          .populate("members", "fullName profilePicture emailAddress")
          .populate("admin", "fullName profilePicture emailAddress")
          .populate("recentMessage");

      if (!chat) {
          return res.status(404).json({ message: "Chat not found" });
      }

      res.status(200).json(chat);
  } catch (error) {
      res.status(500).json({ message: "Error fetching chat", error: error.toString() });
  }
});

// Fetch messages for a given chat
const fetchMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const { page = 1, limit = 20 } = req.query;
  try {
    const chat = await Chat.findById(chatId)
      .populate("members", "fullName profilePicture emailAddress");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const startIndex = (page - 1) * limit;
    const messages = chat.messages.slice(startIndex, startIndex + limit);

    const populatedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findById(message.sender).select("fullName profilePicture emailAddress");
        return {
          ...message.toObject(),
          sender,
        };
      })
    );

    res.json(populatedMessages);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve messages", error: error.message });
  }
});

// Send a new message
const postMessage = asyncHandler(async (req, res) => {
  const { body, chatId } = req.body;

  if (!body || !chatId) {
    return res.status(400).json({ message: "Message body and chat ID must be provided" });
  }

  try {
    const newMessage = {
      sender: req.user._id,
      body: body,
      createdAt: new Date()
    };

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push(newMessage);
    await chat.save();

    // Populate the sender field of the last message
    const populatedChat = await Chat.findById(chatId).populate({
      path: 'messages.sender',
      select: 'fullName profilePicture emailAddress'
    });

    const populatedMessage = populatedChat.messages[populatedChat.messages.length - 1];

    console.log('Populated message with _id:', populatedMessage); // Log the populated message to verify _id

    res.status(201).json({ chatId, message: populatedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
});




// Delete chat and related messages
const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  console.log(`Attempting to delete chat with ID: ${chatId}`);

  try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
          console.log("Chat not found");
          return res.status(404).json({ message: "Chat not found" });
      }

      console.log(`Chat found, checking authorization for user ID: ${req.user._id}`);
      const isAdmin = chat.isGroup && chat.admin.equals(req.user._id);
      const isMember = chat.members.some(member => member.equals(req.user._id));

      if (chat.isGroup && !isAdmin) {
          console.log("User not authorized to delete group chat");
          return res.status(403).json({ message: "Only admins can delete this group chat" });
      } else if (!chat.isGroup && !isMember) {
          console.log("User not authorized to delete this chat");
          return res.status(403).json({ message: "User not authorized" });
      }

      console.log("User authorized, deleting chat...");
      await Chat.findByIdAndDelete(chatId);  
      console.log("Chat deleted successfully.");

      return res.status(200).json({ message: "Chat and related messages deleted" });
  } catch (error) {
      console.error(`Error during chat deletion: ${error}`);
      return res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});

// Create a new group chat
const createGroupChat = asyncHandler(async (req, res) => {
  const { members, name } = req.body;

  if (!members || !name) {
    return res.status(400).json({ message: "All fields are required to create a group chat" });
  }

  if (members.length < 2) {
    return res.status(400).json({ message: "More than two members are required to form a group chat" });
  }

  try {
    const groupChat = await Chat.create({
      name,
      members: [...members, req.user._id],
      isGroup: true,
      admin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("members", "fullName profilePicture emailAddress")
      .populate("admin", "fullName profilePicture emailAddress");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: "Failed to create group chat", error: error.message });
  }
});

// Rename a group chat
const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, newName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { name: newName },
      { new: true }
    )
      .populate("members", "fullName profilePicture emailAddress")
      .populate("admin", "fullName profilePicture emailAddress");

    if (!updatedChat) {
      res.status(404).json({ message: "Chat not found" });
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: "Failed to rename chat", error: error.message });
  }
});

// Add a user to a group chat
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  if (chat.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only admins can add users" });
  }

  if (chat.members.includes(userId)) {
    return res.status(400).json({ message: "User already in the group" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { members: userId } }, 
      { new: true }
    )
      .populate("members", "fullName profilePicture emailAddress")
      .populate("admin", "fullName profilePicture emailAddress");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(400).json({ message: "Failed to add user to group", error: error.message });
  }
});

// Remove a user from a group chat
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  if (chat.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only admins can remove users" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { members: userId } },
      { new: true }
    )
      .populate("members", "fullName profilePicture emailAddress")
      .populate("admin", "fullName profilePicture emailAddress");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(400).json({ message: "Failed to remove user from group", error: error.message });
  }
});

module.exports = {
  fetchOrCreateChat,
  fetchAllChats,
  fetchChatById,
  deleteChat,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
  fetchMessages,
  postMessage,
  fetchAllMembers
};
