import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Header.css";
import Loading from "../Loading/Loading";
import ProfileModal from "../Miscellaneous/ProfileModal/ProfileModal";
import ListItem from "../Avatar/ListItem/ListItem";
import { setSelectedChat, fetchChats } from "../../features/chat/chatSlice";
import logo from "../../assets/logo-white.svg";


function Header() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, chats } = useSelector((state) => state.chat);

  const handleSearch = useCallback(async () => {
    if (!search.trim()) {
      setSearchResult([]);
      return;
    }

    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.get(
        `/api/user?search=${encodeURIComponent(search)}`,
        config
      );
      setSearchResult(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search API Error:", error);
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  }, [search, user.token]);

  useEffect(() => {
    handleSearch();
  }, [search, handleSearch]);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    dispatch(setSelectedChat(null));
    navigate("/");
  };

  const accessChat = async (userId) => {
    setLoadingChat(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) {
        dispatch(setSelectedChat(data));
        dispatch(fetchChats());
      }
      setLoadingChat(false);
    } catch (error) {
      console.error("Error fetching the chat:", error);
      setLoadingChat(false);
    }
  };

  return (
    <>
      <div className="side-drawer-header">
        <div className="left-section">
          <button onClick={openSearch}>Search User</button>
        </div>
        <div className="center-section">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="right-section">
          <div className="profile-container">
            <ProfileModal user={user}>
              <button onClick={() => console.log("My Profile")}>My Profile</button>
            </ProfileModal>
          </div>
          <div className="logout-container">
            <button onClick={logoutHandler}>Logout</button>
          </div>
        </div>
      </div>
      {isSearchOpen && (
        <div className={`search-overlay ${isSearchOpen ? "open" : ""}`}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email" />
          <button onClick={closeSearch}>Close Search</button>
          {loading ? <Loading /> : searchResult.map((resultUser) => (
            <ListItem key={resultUser._id} user={resultUser} handleFunction={() => accessChat(resultUser._id)} />
          ))}
        </div>
      )}
      {loadingChat && <span>Loading...</span>}
    </>
  );
}

export default Header;