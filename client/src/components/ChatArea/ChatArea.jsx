import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  receiveMessage,
  fetchMessages,
  sendMessage as sendMessageRedux,
} from "../../features/chat/chatSlice";
import { selectMessagesByChatId } from "../../selectors/selectors";
import io from "socket.io-client";
import Scroll from "../Scroll/Scroll";
import "./ChatArea.css";
import { throttle } from "lodash";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import UpdateGroupChatModal from "../Miscellaneous/UpdateGroupChatModal/UpdateGroupChatModal";

const ENDPOINT = "http://localhost:5000";

const ChatArea = () => {
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  const { selectedChat, user, messages } = useSelector(state => ({
    selectedChat: state.chat.selectedChat,
    user: state.chat.user,
    notifications: state.chat.notifications,
    messages: selectMessagesByChatId(state, state.chat.selectedChat?._id)
  }), shallowEqual);

  const [isTyping, setIsTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const previousMessages = useRef(messages);

  const throttleEmitTyping = useRef(
    throttle((isTyping) => {
      if (socketRef.current) {
        socketRef.current.emit("typing", {
          chatId: selectedChat?._id,
          userId: user._id,
          isTyping,
        });
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (!user || !selectedChat?._id) return;
  
    const socket = io(ENDPOINT, { auth: { token: user.token } });
    socketRef.current = socket;
  
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
      socket.emit("join chat", selectedChat?._id);
      dispatch(fetchMessages(selectedChat._id));
    });
  
    const messageHandler = (newMessageReceived) => {
      if (selectedChat?._id === newMessageReceived.chatId) {
        const { message } = newMessageReceived;
  
        if (message && message.sender && message.body && message.createdAt && message._id) {
          const payload = {
            chatId: newMessageReceived.chatId,
            message: {
              ...message,
              sender: {
                _id: message.sender._id,
                fullName: message.sender.fullName || "Unknown",
                profilePicture: message.sender.profilePicture || "/default-avatar.png"
              }
            }
          };
  
          // Check if the message already exists in the state
          if (!previousMessages.current.some(msg => msg._id === message._id)) {
            dispatch(receiveMessage(payload));
            setUpdateTrigger(prev => prev + 1);
          } else {
            console.log("Duplicate message detected and ignored:", newMessageReceived);
          }
        }
      }
    };
  
    socket.on("message received", messageHandler);
  
    socket.on("typing", ({ chatId, userId, isTyping }) => {
      if (userId !== user._id && chatId === selectedChat?._id) {
        setIsTyping(isTyping);
      }
    });
  
    return () => {
      socket.off("message received", messageHandler);
      socket.off("typing");
      socket.disconnect();
      setSocketConnected(false);
    };
  }, [user, selectedChat?._id, dispatch]);
  
  useEffect(() => {
    previousMessages.current = messages;
  }, [messages]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    throttleEmitTyping(true);
  };

  const handleKeyUp = () => {
    throttleEmitTyping(false);
  };

  const sendMessageHandler = async (event) => {
    if (event.key && event.key !== "Enter") return;

    if (newMessage.trim()) {
      const messageDetails = {
        sender: {
          _id: user._id,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          emailAddress: user.emailAddress,
        },
        body: newMessage,
        createdAt: new Date().toISOString(),
      };

      try {
        const result = await dispatch(sendMessageRedux({ ...messageDetails, chatId: selectedChat._id })).unwrap();
        const savedMessage = result.message;

        if (socketRef.current) {
          const messageToEmit = {
            chatId: selectedChat._id,
            _id: savedMessage._id,
            sender: savedMessage.sender,
            body: savedMessage.body,
            createdAt: savedMessage.createdAt,
          };

          socketRef.current.emit("new message", messageToEmit);
        }

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleSendClick = () => {
    sendMessageHandler({ key: "Enter" });
  };

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="chat-area-container">
      {selectedChat ? (
        <>
          {selectedChat?.isGroup && selectedChat?.admin?._id === user?._id && (
            <div className="chat-header">
              <button className="group-settings-button" onClick={handleToggleModal}>
                Manage Group
              </button>
            </div>
          )}
          <UpdateGroupChatModal isOpen={showModal} closeModal={handleToggleModal} />
          <Scroll key={updateTrigger} messages={messages} />
          <div className="chat-input-container">
            <TypingIndicator isTyping={isTyping} />
            <div className="chat-footer">
              <input
                type="text"
                className="chat-input"
                placeholder="Enter a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyUp={handleKeyUp}
                onKeyDown={sendMessageHandler}
                disabled={!socketConnected}
              />
              <button onClick={handleSendClick} className="send-button">
                Send
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="chat-empty">Click on a user to start chatting</div>
      )}
    </div>
  );
};

export default ChatArea;
