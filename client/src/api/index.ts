// Import necessary modules and utilities
import axios, { InternalAxiosRequestConfig } from "axios";
import { LocalStorage } from "../utils";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true, // Enable sending cookies with cross-site requests
  timeout: 120000, // Set request timeout to 2 minutes
});

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    // Retrieve user token from local storage
    const token = LocalStorage.get("token");

    // Set authorization header with bearer token if token exists
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      } as typeof config.headers & { Authorization: string };
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// API functions for different actions
const registerUser = (data: {
  firstName: string;
  lastName: string;
  password: string;
  username: string;
  email: string;
}) => {
  return apiClient.post("/auth/register", data);
};

const loginUser = (data: { username: string; password: string }) => {
  return apiClient.post("/auth/login", data);
};

const logoutUser = () => {
  return apiClient.get("/auth/logout");
};

// const getAvailableUsers = () => {
//   return apiClient.get("/chat-app/chats/users");
// };

// const getUserChats = () => {
//   return apiClient.get(`/chat-app/chats`);
// };

// const createUserChat = (receiverId: string) => {
//   return apiClient.post(`/chat-app/chats/c/${receiverId}`);
// };

// const createGroupChat = (data: { name: string; participants: string[] }) => {
//   return apiClient.post(`/chat-app/chats/group`, data);
// };

// const getGroupInfo = (chatId: string) => {
//   return apiClient.get(`/chat-app/chats/group/${chatId}`);
// };

// const updateGroupName = (chatId: string, name: string) => {
//   return apiClient.patch(`/chat-app/chats/group/${chatId}`, { name });
// };

// const deleteGroup = (chatId: string) => {
//   return apiClient.delete(`/chat-app/chats/group/${chatId}`);
// };

// const deleteOneOnOneChat = (chatId: string) => {
//   return apiClient.delete(`/chat-app/chats/remove/${chatId}`);
// };

// const addParticipantToGroup = (chatId: string, participantId: string) => {
//   return apiClient.post(`/chat-app/chats/group/${chatId}/${participantId}`);
// };

// const removeParticipantFromGroup = (chatId: string, participantId: string) => {
//   return apiClient.delete(`/chat-app/chats/group/${chatId}/${participantId}`);
// };

// const getChatMessages = (chatId: string) => {
//   return apiClient.get(`/chat-app/messages/${chatId}`);
// };

// const sendMessage = (chatId: string, content: string, attachments: File[]) => {
//   const formData = new FormData();
//   if (content) {
//     formData.append("content", content);
//   }
//   attachments?.map((file) => {
//     formData.append("attachments", file);
//   });
//   return apiClient.post(`/chat-app/messages/${chatId}`, formData);
// };

// const deleteMessage = (chatId: string, messageId: string) => {
//   return apiClient.delete(`/chat-app/messages/${chatId}/${messageId}`);
// };

// Export all the API functions
export {
  registerUser,
  loginUser,
  logoutUser,
  // addParticipantToGroup,
  // createGroupChat,
  // createUserChat,
  // deleteGroup,
  // deleteOneOnOneChat,
  // getAvailableUsers,
  // getChatMessages,
  // getGroupInfo,
  // getUserChats,
  // removeParticipantFromGroup,
  // sendMessage,
  // updateGroupName,
  // deleteMessage,
};
