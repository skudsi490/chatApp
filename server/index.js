const express = require("express");
const connectDB = require("./config/connectDB");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandling");
const path = require("path");
const cors = require("cors");
const Chat = require("./models/chatModel");
const User = require("./models/userModel");

dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const typingTimeouts = {};


let messageQueue = [];


const processMessageQueue = async () => {
  if (messageQueue.length === 0) return;
  console.log(`Processing ${messageQueue.length} messages from the queue...`);

  const messagesToSave = [...messageQueue];
  messageQueue = [];

  try {
    for (const newMessageReceived of messagesToSave) {
      const { chatId, _id, sender, body, createdAt } = newMessageReceived;
      
      console.log(`Processing message with ID: ${_id}`);

      const chat = await Chat.findById(chatId).populate(
        "members",
        "fullName profilePicture emailAddress"
      );

      if (!chat) {
        console.error(`Chat not found with ID: ${chatId}`);
        continue;
      }

      let senderDetails = chat.members.find(
        (member) => member._id.toString() === sender._id.toString()
      );
      if (!senderDetails) {
        senderDetails = await User.findById(sender._id).select(
          "fullName profilePicture emailAddress"
        );
        if (!senderDetails) {
          console.error(`Sender not found with ID: ${sender._id}`);
          continue;
        }
      }

      const messageWithDetails = {
        _id,
        sender: {
          _id: senderDetails._id,
          fullName: senderDetails.fullName,
          profilePicture: senderDetails.profilePicture,
          emailAddress: senderDetails.emailAddress,
        },
        body,
        createdAt,
      };

      
      if (!chat.messages.id(_id)) {
        chat.messages.push(messageWithDetails);
        await chat.save();
      }
    }
  } catch (error) {
    console.error(`Error processing messages: ${error}`);
  }
};


setInterval(processMessageQueue, 1000);

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User Joined Room: ${room}`);
  });

  socket.on("typing", ({ chatId, userId, isTyping }) => {
    const key = `${chatId}-${userId}`;
    clearTimeout(typingTimeouts[key]);

    socket.to(chatId).emit("typing", { chatId, userId, isTyping });

    typingTimeouts[key] = setTimeout(() => {
      socket.to(chatId).emit("typing", { chatId, userId, isTyping: false });
    }, 5000);
  });

  socket.on("new message", async (newMessageReceived) => {
    console.log(`New message received: ${JSON.stringify(newMessageReceived)}`);
  
    const { chatId, _id, sender, body, createdAt } = newMessageReceived;
    if (!chatId || !_id || !sender || !body || !createdAt) {
      console.error("Invalid or missing fields in the received message:", newMessageReceived);
      return;
    }

    
    if (!messageQueue.find(msg => msg._id === _id)) {
      messageQueue.push(newMessageReceived);
    } else {
      console.log("Duplicate message detected and ignored:", newMessageReceived);
    }

    
    const chat = await Chat.findById(chatId).populate(
      "members",
      "fullName profilePicture emailAddress"
    );

    if (!chat) {
      console.error(`Chat not found with ID: ${chatId}`);
      return;
    }

    let senderDetails = chat.members.find(
      (member) => member._id.toString() === sender._id.toString()
    );
    if (!senderDetails) {
      senderDetails = await User.findById(sender._id).select(
        "fullName profilePicture emailAddress"
      );
      if (!senderDetails) {
        console.error(`Sender not found with ID: ${sender._id}`);
        return;
      }
    }

    const messageWithDetails = {
      _id,
      sender: {
        _id: senderDetails._id,
        fullName: senderDetails.fullName,
        profilePicture: senderDetails.profilePicture,
        emailAddress: senderDetails.emailAddress,
      },
      body,
      createdAt,
    };

    chat.members.forEach((member) => {
      if (member._id.toString() !== sender._id.toString()) {
        io.to(member._id.toString()).emit("message received", { chatId, message: messageWithDetails });
      }
    });
    io.to(sender._id.toString()).emit("message received", { chatId, message: messageWithDetails });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});
