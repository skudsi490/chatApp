import { createSelector } from 'reselect';


const selectChatData = state => state.chat;


export const selectChats = createSelector(
  [selectChatData],
  chat => Array.isArray(chat.chats) ? chat.chats : []
);


export const selectMessagesByChatId = createSelector(
  [selectChats, (state, chatId) => chatId],
  (chats, chatId) => {
    const chat = chats.find(chat => chat._id === chatId);
    return chat ? chat.messages : [];
  }
);
