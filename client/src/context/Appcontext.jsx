import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createContext } from "react";
import axios from 'axios';
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

export const AppContext = createContext({ chats: [], theme: 'light' });

export const AppContextProvider = ({ children }) => {

  const navigate = useNavigate();
  const [user, setUser]                   = useState(null);
  const [showHero, setShowHero]           = useState(true);
  const [chats, setChats]                 = useState([]);
  const [selectedChat, setSelectedChat]   = useState(null);
  const [theme, setTheme]                 = useState(localStorage.getItem('theme') || 'light');
  const [token, setToken]                 = useState(null);
  const [pricing, setPricing]             = useState(null);
  const [chatMode, setChatMode]           = useState("chat");
  const [authReady, setAuthReady]         = useState(false);

  // ── load token from storage ──
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      fetchUser(token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  // ── redirect unauthenticated users ──
  useEffect(() => {
    if (authReady && !user) {
      const publicPaths = ["/login", "/pricing", "/community"];
      if (!publicPaths.includes(window.location.pathname)) {
        navigate("/login");
      }
    }
  }, [authReady, user]);

  // ── restore last chat on refresh ──
  useEffect(() => {
    if (!chats || chats.length === 0) return;
    const lastChatId = localStorage.getItem("last_chat_id");
    const foundChat  = chats.find(c => c._id === lastChatId);
    if (foundChat) {
      setSelectedChat(foundChat);
      setShowHero(false);
    } else {
      setSelectedChat(chats[0]);
      setShowHero(false);
    }
  }, [chats]);

  // ── theme ──
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // ── fetchUser ──
  const fetchUser = async (authToken) => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (data.success) {
        setUser(data.user);
      } else {
        toast(data.message);
        localStorage.removeItem("token");
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      toast.error(error.message);
    } finally {
      setAuthReady(true);
    }
  };

  // ── fetchUserChats ──
  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get('/api/chat/get', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success && Array.isArray(data.chats)) {
        setChats(data.chats);
        if (data.chats.length > 0) {
          const lastChatId = localStorage.getItem("last_chat_id");
          const last = data.chats.find(c => c._id === lastChatId);
          setSelectedChat(last || data.chats[0]);
          setShowHero(false);
        } else {
          setSelectedChat(null);
          setShowHero(true);
        }
      } else {
        setChats([]);
        setShowHero(true);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Server error");
    }
  };
  
  // api to create a new chat
  const createNewChat = async () => {
    if (!user) {
      toast.error("Please login to create a new chat");
      navigate("/login");
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/chat/create", {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        const newChat = data.chat;
        setChats(prev => {
          const exists = prev.find(c => c._id === newChat._id);
          if (exists) return prev;
          return [newChat, ...prev];
        });
        setSelectedChat(newChat);
        setShowHero(true);
        localStorage.setItem("last_chat_id", newChat._id);
      }
    } catch (err) {
      toast.error("Failed to create chat");
    }
  };

  // ── deleteChat ──
  const deleteChat = async (chatId) => {
    try {
      if (!chatId || chatId.length < 20) {
        setChats(prev => {
          const updated = prev.filter(c => c._id !== chatId);
          if (selectedChat?._id === chatId) {
            setSelectedChat(updated.length > 0 ? updated[0] : null);
            if (updated.length === 0) setShowHero(true);
          }
          return updated;
        });
        return;
      }
      console.log("DELETE URL:", axios.defaults.baseURL + `/api/chat/delete/${chatId}`);
      await axios.delete(`/api/chat/delete/${chatId}`, {  // ← removed leading /
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setChats(prev => {
        const updated = prev.filter(c => c._id !== chatId);
        if (selectedChat?._id === chatId) {
          setSelectedChat(updated.length > 0 ? updated[0] : null);
          if (updated.length === 0) setShowHero(true);
        }
        return updated;
      });
  
      toast.success("Chat deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete chat");
    }
  };

  // ── renameChat ──
  const renameChat = async (chatId, newName) => {
    if (!newName || !newName.trim()) return;

    try {
      const { data } = await axios.put(
        `/api/chat/rename/${chatId}`,
        { name: newName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setChats(prev =>
          prev.map(c => c._id === chatId ? { ...c, name: newName.trim() } : c)
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(prev => ({ ...prev, name: newName.trim() }));
        }
        toast.success("Chat renamed");
      }
    } catch (error) {
      console.error("Rename failed:", error);
      toast.error("Failed to rename chat");
    }
  };

  // ── logout ──
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("last_chat_id");
    setUser(null);
    setChats([]);
    setSelectedChat(null);
    setShowHero(true);
    navigate("/login");
  };

  return (
    <AppContext.Provider value={{
      navigate,
      user, setUser,
      chats, setChats,
      selectedChat, setSelectedChat,
      theme, setTheme,
      pricing,
      fetchUserChats, createNewChat,
      token, setToken,
      axios,
      deleteChat, renameChat,
      logout,
      chatMode, setChatMode,
      fetchUser,
      authReady,
      showHero, setShowHero,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};