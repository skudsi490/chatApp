import { useState } from 'react';
import { useSelector } from 'react-redux';
import ChatBox from "../../components/ChatBox/ChatBox";
import ChatsList from "../../components/ChatsList/ChatsList";
import Header from "../../components/Header/Header";
import './Chat.css';  

const Chat = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = useSelector(state => state.chat);

  return (
    <div className="chat-container">
      {user && (
        <>
          <Header />
          <div className="chat-main">
            <ChatsList fetchAgain={fetchAgain} />
            <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;