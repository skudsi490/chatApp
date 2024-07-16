// E:\sites\NEW\Final-try\chatApp-v1\client\src\components\ChatsList\ChatsList.jsx

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./ChatsList.css";
import Loading from "../Loading/Loading";
import GroupChatModal from "../Miscellaneous/GroupChatModal/GroupChatModal";
import {
  setSelectedChat,
  fetchChats as fetchChatsThunk,
  deleteChatAction,
} from "../../features/chat/chatSlice";
import { selectChats } from "../../selectors/selectors";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket;

const ChatsList = ({ fetchAgain }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.chat.user);
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const chats = useSelector(selectChats);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchChatsThunk());
    }
  }, [user, fetchAgain, dispatch]);

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT, { auth: { token: user.token } });

      socket.emit("setup", user);

      socket.on("connected", () => {
        console.log("Socket connected in ChatsList");
      });

      socket.on("message received", (newMessageReceived) => {
        console.log("New message received in ChatsList:", newMessageReceived);
        dispatch(fetchChatsThunk()); 
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDeleteChat = (chatId, isGroup, isAdmin) => {
    const message = isGroup
      ? "Are you sure you want to delete this group chat?"
      : "Are you sure you want to delete this chat?";

    if (isGroup && !isAdmin) {
      alert("You must be an admin to delete this group chat.");
      return; 
    }

    if (window.confirm(message)) {
      dispatch(deleteChatAction(chatId));
    }
  };

  const getSender = (loggedUser, members) => {
    if (!members || members.length === 0) {
      console.error("getSender: Members array is empty or undefined", members);
      return "No Members";
    }
    const otherMember = members.find(member => member._id !== loggedUser._id);
    return otherMember ? otherMember.fullName : "User Not Found";
  };

  if (!chats.length) {
    return <Loading />;
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1 className="chat-header-title">My Chats 🗨️</h1>
        <button onClick={toggleModal} className="chat-list-button">
          New Group Chat
        </button>
      </div>
      {isModalOpen && (
        <GroupChatModal isOpen={isModalOpen} closeModal={toggleModal} />
      )}
      <div className="chat-list-body">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`chat-item ${selectedChat === chat ? "active" : ""}`}
            onClick={() => dispatch(setSelectedChat(chat))}
          >
            <div className="chat-item-text">
              {chat.isGroup ? chat.name : getSender(user, chat.members)}
            </div>
            {chat.latestMessage && (
              <div className="chat-item-preview">
                <strong>{chat.latestMessage.sender.name}:</strong>
                {chat.latestMessage.content.length > 50
                  ? `${chat.latestMessage.content.substring(0, 50)}...`
                  : chat.latestMessage.content}
              </div>
            )}
            {(chat.isGroup ? user._id === chat.admin?._id : true) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(
                    chat._id,
                    chat.isGroup,
                    chat.isGroup && chat.admin && user._id === chat.admin._id
                  );
                }}
                className="delete-chat-button"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatsList;
