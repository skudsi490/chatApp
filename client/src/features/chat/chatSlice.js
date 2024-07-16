// E:\TESI-FINAL\chatApp-v1\client\src\features\chat\chatSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

const initialState = {
    selectedChat: null,
    user: JSON.parse(localStorage.getItem("userInfo")) || null,
    chats: [],
    members: [], 
    status: "idle",
    error: null,
};

export const fetchMembers = createAsyncThunk(
    "chat/fetchMembers",
    async (_, { getState }) => {
        const state = getState();
        const config = {
            headers: {
                Authorization: `Bearer ${state.chat.user.token}`,
            },
        };
        const response = await axios.get("/api/chat/members", config);
        return response.data;
    }
);

export const fetchChats = createAsyncThunk(
    "chat/fetchChats",
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        const config = {
            headers: {
                Authorization: `Bearer ${state.chat.user.token}`,
            },
        };
        const response = await axios.get("/api/chat", config);
        const chats = response.data;
        
        // Extract members from chats
        const membersSet = new Set();
        chats.forEach(chat => {
            chat.members.forEach(member => membersSet.add(JSON.stringify(member)));
        });
        const members = Array.from(membersSet).map(member => JSON.parse(member));

        thunkAPI.dispatch(setMembers(members));
        return chats;
    }
);

export const fetchMessages = createAsyncThunk(
    "chat/fetchMessages",
    async (chatId, { getState }) => {
        const state = getState();
        const config = {
            headers: {
                Authorization: `Bearer ${state.chat.user.token}`,
            },
        };
        const response = await axios.get(`/api/chat/${chatId}/messages`, config);
        return { chatId, messages: response.data };
    }
);

export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async (messageDetails, { getState }) => {
        const { user, members } = getState().chat;

        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        const response = await axios.post(`/api/chat/${messageDetails.chatId}/messages`, messageDetails, config);
        const enhancedMessage = enhanceMessage(response.data.message, members);

        return {
            chatId: messageDetails.chatId,
            message: enhancedMessage,
        };
    }
);

export const deleteChatAction = createAsyncThunk(
    'chat/deleteChat',
    async (chatId, { getState, dispatch }) => {
        const state = getState();
        const config = {
            headers: {
                Authorization: `Bearer ${state.chat.user.token}`,
            },
        };
        await axios.delete(`/api/chat/${chatId}`, config);
        dispatch(fetchChats());
        return chatId;
    }
);

export const loginUser = createAsyncThunk(
    "chat/loginUser",
    async (userCredentials, { dispatch }) => {
        const response = await axios.post("/api/user/login", userCredentials);
        localStorage.setItem("userInfo", JSON.stringify(response.data));
        dispatch(fetchMembers());
        return response.data;
    }
);

export const registerUser = createAsyncThunk(
    "chat/registerUser",
    async (userData, { dispatch }) => {
        const response = await axios.post("/api/user/register", userData);
        localStorage.setItem("userInfo", JSON.stringify(response.data));
        dispatch(fetchMembers());
        return response.data;
    }
);

export const enhanceMessage = (message, members) => {
    const senderId = message.sender._id || message.sender;
    const senderDetails = members.find(member => member._id === senderId) || message.sender;
    return {
        ...message,
        sender: {
            _id: senderId,
            fullName: senderDetails.fullName || "Unknown",
            profilePicture: senderDetails.profilePicture || "/default-avatar.png"
        }
    };
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },
        setUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem("userInfo", JSON.stringify(state.user));
        },
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setMembers: (state, action) => {
            state.members = action.payload;
        },
        receiveMessage: (state, action) => {
            const { chatId, message } = action.payload;
            const chat = state.chats.find(chat => chat._id === chatId);
            if (chat && !chat.messages.some(msg => msg._id === message._id)) {
                chat.messages.push(enhanceMessage(message, state.members));
                chat.recentMessage = message.createdAt;
            }
        },
        receiveMessages: (state, action) => {
            action.payload.forEach(({ chatId, message }) => {
                const chat = state.chats.find(chat => chat._id === chatId);
                if (chat && !chat.messages.some(msg => msg._id === message._id)) {
                    chat.messages.push(enhanceMessage(message, state.members));
                    chat.recentMessage = message.createdAt;
                }
            });
        },
        updateChatDetails: (state, action) => {
            const index = state.chats.findIndex(chat => chat._id === action.payload._id);
            if (index !== -1) state.chats[index] = { ...state.chats[index], ...action.payload };
        },
        addMemberToChat: (state, action) => {
            const { chatId, newMember } = action.payload;
            const chat = state.chats.find(chat => chat._id === chatId);
            if (chat && !chat.members.find(member => member._id === newMember._id)) {
                chat.members.push(newMember);
            }
        },
        removeMemberFromChat: (state, action) => {
            const { chatId, memberId } = action.payload;
            const chat = state.chats.find(chat => chat._id === chatId);
            if (chat) {
                chat.members = chat.members.filter(member => member._id !== memberId);
            }
        },
        logout: (state) => {
            localStorage.removeItem("userInfo");
            state.user = null;
            state.selectedChat = null;
            state.chats = [];
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.pending, (state) => { state.status = "loading"; })
            .addCase(fetchChats.fulfilled, (state, action) => { state.status = "succeeded"; state.chats = action.payload; })
            .addCase(fetchChats.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
            .addCase(fetchMembers.fulfilled, (state, action) => { state.members = action.payload; })
            .addCase(loginUser.fulfilled, (state, action) => { state.user = action.payload; })
            .addCase(registerUser.fulfilled, (state, action) => { state.user = action.payload; })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                const { chatId, messages } = action.payload;
                const chat = state.chats.find(chat => chat._id === chatId);
                if (chat) {
                    chat.messages = messages.map(msg => enhanceMessage(msg, state.members));
                }
            })
            .addCase(deleteChatAction.fulfilled, (state, action) => {
                state.chats = state.chats.filter(chat => chat._id !== action.payload);
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                const { chatId, message } = action.payload;
                const chat = state.chats.find(chat => chat._id === chatId);
                if (chat && !chat.messages.some(msg => msg._id === message._id)) {
                    chat.messages.push(enhanceMessage(message, state.members));
                    chat.recentMessage = message.createdAt;
                }
            });
    },
});

export const {
    setSelectedChat,
    setUser,
    setChats,
    updateChatDetails,
    addMemberToChat,
    removeMemberFromChat,
    logout,
    resetState,
    receiveMessage,
    receiveMessages,
    setMembers 
} = chatSlice.actions;

export default chatSlice.reducer;
