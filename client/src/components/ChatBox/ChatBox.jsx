import { useSelector } from 'react-redux';
import ChatArea from '../ChatArea/ChatArea';
import './ChatBox.css';

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
    const selectedChat = useSelector(state => state.chat.selectedChat);

  
    if (!selectedChat) {
        return null; 
    }

    return (
        <div className="chat-box-container">
            <ChatArea fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default ChatBox;
