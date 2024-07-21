import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSelector, shallowEqual } from "react-redux";
import "./Scroll.css";
import { enhanceMessage } from "../../features/chat/chatSlice";

const MessageComponent = ({ message, user }) => {
    const { sender, body, createdAt } = message;
    const senderId = sender._id || sender;
    const isCurrentUserMessage = senderId === user._id;
    const avatarLink = sender.profilePicture || '/default-avatar.png';

    const [showTimestamp, setShowTimestamp] = useState(false);

    const toggleTimestamp = () => {
        setShowTimestamp(!showTimestamp);
    };

    return (
        <div className={`message ${isCurrentUserMessage ? "my-message" : "other-message"}`}>
            <div className={`avatar-container ${isCurrentUserMessage ? "right" : "left"}`} title={sender.fullName || "Unknown"}>
                <img className="avatar" alt={sender.fullName || "Unknown"} src={avatarLink} onClick={toggleTimestamp} />
                <div className="sender-info">
                    <div className="sender-name">{sender.fullName || "Unknown"}</div>
                    {showTimestamp && (
                        <div className="message-timestamp">
                            {new Date(createdAt).toLocaleDateString()}<br />
                            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            </div>
            <div className={`message-body ${isCurrentUserMessage ? "current-user" : "other-user"}`}>
                <div className="message-text">{body}</div>
            </div>
        </div>
    );
};

const Message = React.memo(MessageComponent);
Message.displayName = 'Message';

const Scroll = ({ messages }) => {
    const user = useSelector(state => state.chat.user, shallowEqual);
    const members = useSelector(state => state.chat.members || [], shallowEqual);
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const enhancedMessages = useMemo(() => {
        return messages.map(message => {
            const enhancedMessage = enhanceMessage(message, members);
            return enhancedMessage;
        });
    }, [messages, members]);

    const messageElements = useMemo(() => {
        return enhancedMessages.map((m, i) => {
            if (!m || !m.sender || !m.body || !m.createdAt || !m._id) {
                return null;
            }

            const senderId = m.sender._id || m.sender;
            if (!senderId) {
                return null;
            }

            const uniqueKey = `${m._id}-${i}`;

            return (
                <Message
                    key={uniqueKey}
                    message={m}
                    user={{
                        _id: user._id,
                        messages,
                        index: i
                    }}
                />
            );
        });
    }, [enhancedMessages, user, messages]);

    return <div ref={scrollRef} className="scroll-feed">{messageElements}</div>;
};

export default Scroll;
