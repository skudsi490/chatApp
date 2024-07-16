const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, trim: true, required: [true, "Message content cannot be empty"] },
    createdAt: { type: Date, default: Date.now }
  },
  {
    _id: true  
  }
);

const chatSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: [true, "Chat name is required"] },
    isGroup: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema], // Embed messages as an array of subdocuments
    recentMessage: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const ChatModel = mongoose.model("Chat", chatSchema, "chats");

module.exports = ChatModel;
