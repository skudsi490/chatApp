import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, shallowEqual } from "react-redux";
import "./Scroll.css";
import { enhanceMessage } from "../../features/chat/chatSlice";

const MessageComponent = ({ message, user }) => {
    const { sender, body } = message;
    const senderId = sender._id || sender;
    const isCurrentUserMessage = senderId === user._id;
    const avatarLink = sender.profilePicture || '/default-avatar.png';

    console.log("Rendering message component:", { message, user });

    return (
        <div className={`message ${isCurrentUserMessage ? "my-message" : "other-message"}`}>
            {!isCurrentUserMessage && (
                <div className="avatar-container" title={sender.fullName || "Unknown"}>
                    <img className="avatar" alt={sender.fullName || "Unknown"} src={avatarLink} />
                    <div className="sender-name">{sender.fullName || "Unknown"}</div>
                </div>
            )}
            <div className={`message-body`}
                style={{
                    marginLeft: isCurrentUserMessage ? "auto" : 10,
                    marginRight: isCurrentUserMessage ? 0 : "auto",
                    backgroundColor: isCurrentUserMessage ? "#DCF8C6" : "#ECE5DD",
                    marginTop: 10,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    alignSelf: isCurrentUserMessage ? "flex-end" : "flex-start",
                    justifyContent: "flex-start"
                }}>
                {body}
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

    console.log("Members in state:", members); 

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const enhancedMessages = useMemo(() => {
        return messages.map(message => {
            const enhancedMessage = enhanceMessage(message, members);
            console.log("Enhanced message:", enhancedMessage);
            return enhancedMessage;
        });
    }, [messages, members]);

    const messageElements = useMemo(() => {
        return enhancedMessages.map((m, i) => {
            if (!m || !m.sender || !m.body || !m.createdAt || !m._id) {
                console.error("Scroll: Invalid message structure", m);
                return null;
            }

            const senderId = m.sender._id || m.sender;
            if (!senderId) {
                console.error("Scroll: Invalid sender structure", m.sender);
                return null;
            }

            const uniqueKey = `${m._id}-${i}`;

            console.log("Rendering message:", {
                key: uniqueKey,
                message: m,
                user: {
                    _id: user._id,
                    messages,
                    index: i
                }
            });

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
