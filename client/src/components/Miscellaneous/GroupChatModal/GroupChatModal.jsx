import axios from "axios";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChats } from "../../../features/chat/chatSlice";
import BadgeItem from "../../Avatar/BadgeItem/BadgeItem";
import ListItem from "../../Avatar/ListItem/ListItem";

const GroupChatModal = ({ closeModal, isOpen }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { user, chats } = useSelector((state) => state.chat);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      alert("User already added");
      return;
    }
    setSelectedUsers((prevUsers) => [...prevUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      alert("Failed to load the search results");
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers((prevUsers) =>
      prevUsers.filter((u) => u._id !== delUser._id)
    );
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      alert("Please fill all the fields and add at least two members to form a group chat");
      return;
    }
  
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          members: selectedUsers.map((u) => u._id),
        },
        config
      );
      dispatch(setChats([data, ...chats])); 
      closeModal();
      alert("New Group Chat Created!");
    } catch (error) {
      console.error("Failed to create the chat:", error);
      alert("Failed to create the chat");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ visibility: isOpen ? 'visible' : 'hidden', opacity: isOpen ? 1 : 0 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5>Create Group Chat</h5>
            <button onClick={closeModal} className="close-button">&times;</button>
          </div>
          <div className="modal-body">
          <input
            type="text"
            placeholder="Chat Name"
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Add Users eg: Sami, Ben, Daniel"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field"
          />
          <div className="selected-users">
            {selectedUsers.map((u) => (
              <BadgeItem
                key={u._id}
                user={u}
                handleFunction={() => handleDelete(u)}
              />
            ))}
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            searchResult
              .slice(0, 4)
              .map((user) => (
                <ListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleGroup(user)}
                />
              ))
          )}
        </div>
        <div className="modal-footer">
            <button onClick={handleSubmit} className="submit-button">Create Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
