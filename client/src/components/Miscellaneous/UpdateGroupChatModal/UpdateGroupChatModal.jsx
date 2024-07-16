import axios from "axios";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedChat,
  setChats,
  updateChatDetails,
} from "../../../features/chat/chatSlice";
import BadgeItem from "../../Avatar/BadgeItem/BadgeItem";
import ListItem from "../../Avatar/ListItem/ListItem";
import './UpdateGroupChatModal.css';

const UpdateGroupChatModal = ({ isOpen, closeModal }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { selectedChat, user, chats } = useSelector((state) => state.chat);

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      console.error("Failed to load the search results", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.members.find((u) => u._id === userToAdd._id)) {
      alert("User already in group");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );

      dispatch(setSelectedChat(data));
      dispatch(
        setChats(chats.map((chat) => (chat._id === data._id ? data : chat)))
      );
    } catch (error) {
      console.error("Failed to add user to group", error);
    }
  };

  const handleRemoveUser = async (userToRemove) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );

      dispatch(setSelectedChat(data));
      dispatch(
        setChats(chats.map((chat) => (chat._id === data._id ? data : chat)))
      );
    } catch (error) {
      console.error("Failed to remove user from group", error);
    }
  };

  const handleRenameGroup = async () => {
    if (!groupChatName) {
      alert("Please enter a name for the group.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          newName: groupChatName,
        },
        config
      );

      dispatch(updateChatDetails(data)); 
      alert("Group chat renamed successfully!");
    } catch (error) {
      console.error("Failed to rename group chat", error);
      alert("Failed to rename group chat.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{selectedChat.chatName}</h5>
              <button onClick={closeModal} className="close-button">&times;</button>{" "}
            </div>
            <div className="modal-content">
              <div className="modal-body">
                <div className="members-container">
                  {selectedChat.members.map((u) => (
                    <BadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleRemoveUser(u)}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  placeholder="New group name"
                  className="input-field"
                />
                <button onClick={handleRenameGroup} className="action-button">Rename</button>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Add user to group"
                  className="input-field"
                />
                <button onClick={handleSearch} className="action-button">Search</button>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  searchResult.map((user) => (
                    <ListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
                )}
              </div>
              <div className="modal-footer">
                <button onClick={closeModal} className="action-button">Close</button>{" "}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateGroupChatModal;
