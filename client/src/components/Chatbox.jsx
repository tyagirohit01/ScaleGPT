import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { useAppContext } from "../context/Appcontext";
import axios from "axios";
import HeroView from "./HeroView";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

const MOCK_RESPONSES = {
  "Scale Fast":     `**Scale Fast** is powered by GPT-4o — optimized for speed and everyday tasks.\n\nWhat it's great at:\n- Answering questions instantly\n- Writing, editing, summarizing\n- Basic coding and debugging\n- Quick lookups and research\n\nConnect your OpenAI API key to enable real responses.`,
  "Scale Pro":      `**Scale Pro** is powered by Claude 3.5 Sonnet — our smartest model for complex reasoning.\n\nWhat it's great at:\n- Deep analysis and research\n- Advanced coding and architecture\n- Long document understanding\n- Nuanced writing and strategy\n\nConnect your Anthropic API key to enable real responses.`,
  "Scale Research": `**Scale Research** is powered by o3 — built for deep thinking and hard problems.\n\nWhat it's great at:\n- Scientific reasoning and math\n- Step-by-step problem solving\n- Research synthesis\n- Logical deduction and proofs\n\nConnect your OpenAI API key to enable real responses.`,
  "Scale Vision":   `**Scale Vision** is powered by GPT-4V — understands images and visuals.\n\nWhat it's great at:\n- Analyzing and describing images\n- Reading charts and diagrams\n- Extracting text from screenshots\n- Visual Q&A and document scanning\n\nUpload an image and connect your OpenAI API key to get started.`,
};

const Chatbox = ({ onMenuClick }) => {
  const {
    chats, setChats,
    selectedChat, setSelectedChat,
    chatMode, token, user, navigate,
    showHero, setShowHero,
  } = useAppContext();

  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [selectedModel, setSelectedModel] = useState("Scale Fast");
  const bottomRef                         = useRef(null);

  const generateTitle = (text) =>
    text ? text.split(" ").slice(0, 4).join(" ") : "New Chat";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  useEffect(() => {
    if (selectedChat?.messages?.length > 0) setShowHero(false);
  }, [selectedChat]);

  const handleSend = async (textOverride, attachedFiles) => {
    const safeFiles = Array.isArray(attachedFiles) ? attachedFiles : [];
    const prompt    = (typeof textOverride === "string" ? textOverride : "") || input;
  
    if (!prompt.trim() && safeFiles.length === 0) return;
    if (!user) { navigate("/login"); return; }
  
    setShowHero(false);
  
    let chat = selectedChat;
    let isNewChat = false;
  
    if (!chat) {
      isNewChat = true;
      chat = {
        _id:       Date.now().toString(),
        name:      generateTitle(prompt),
        mode:      chatMode || "chat",
        messages:  [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChats(prev => [chat, ...prev]);
      setSelectedChat(chat);
    }
  
    const tempId = chat._id; // ← save temp id before API call
  
    const userMessage = {
      role:      "user",
      content:   prompt || "📎 Sent a file",
      timestamp: Date.now(),
      ...(safeFiles.length > 0 && { attachments: safeFiles }),
    };
  
    const updatedChat = {
      ...chat,
      messages:  [...(chat.messages || []), userMessage],
      updatedAt: new Date(),
    };
  
    setChats(prev => prev.map(c => c._id === tempId ? updatedChat : c));
    setSelectedChat(updatedChat);
    setInput("");
    setLoading(true);
  
    try {
      const { data } = await axios.post(
        "/api/chat/ai",
        {
          chatId: tempId,
          prompt: prompt || "User sent a file attachment",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (data.success) {
        const aiMessage = {
          role:      "assistant",
          content:   data.reply?.content || data.message || MOCK_RESPONSES[selectedModel] || "Got it!",
          timestamp: Date.now(),
        };
  
        const realId   = data.chatId   || tempId;
        const realName = data.chatName || updatedChat.name;
  
        const chatWithReply = {
          ...updatedChat,
          _id:       realId,
          name:      realName,
          messages:  [...updatedChat.messages, aiMessage],
          updatedAt: new Date(),
        };
  
        // ← replace by tempId not realId — tempId is what's currently in state
        setChats(prev => prev.map(c => c._id === tempId ? chatWithReply : c));
        setSelectedChat(chatWithReply);
        localStorage.setItem("last_chat_id", realId);
      } else {
        throw new Error(data.message || "API returned failure");
      }
    } catch (error) {
      console.error("Message send failed:", error.message);
  
      const fallback = MOCK_RESPONSES[selectedModel] ||
        `You're chatting with **${selectedModel}**.\n\nConnect your API key to enable real AI responses.`;
  
      const aiMessage = {
        role:      "assistant",
        content:   fallback,
        timestamp: Date.now(),
      };
      const chatWithReply = {
        ...updatedChat,
        messages:  [...updatedChat.messages, aiMessage],
        updatedAt: new Date(),
      };
      setChats(prev => prev.map(c => c._id === tempId ? chatWithReply : c));
      setSelectedChat(chatWithReply);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", width: "100%",
      overflow: "hidden", background: "#06060e",
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        padding: "0 16px", height: 50, flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#06060e",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onMenuClick}
            className="md:hidden"
            style={{
              background: "none", border: "none",
              color: "#9090b0", fontSize: 18,
              cursor: "pointer", padding: "4px 8px 4px 0",
              display: "flex", alignItems: "center", flexShrink: 0,
            }}
          >☰</button>

          <span style={{
            fontSize: 13, fontWeight: 500, color: "#9090b0",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "clamp(100px, 30vw, 260px)",
          }}>
            {showHero ? "ScaleGPT" : selectedChat?.name || "Conversation"}
          </span>

          <span style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 20,
            background: "rgba(165,112,247,.12)",
            border: "1px solid rgba(165,112,247,.25)",
            color: "#a370f7", fontWeight: 600, flexShrink: 0,
          }}>{selectedModel}</span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["↗ Share", "⚙"].map(label => (
            <button key={label} style={{
              background: "#10101f",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 7, color: "#9090b0",
              fontSize: 11, fontWeight: 500,
              padding: "5px 10px", cursor: "pointer", flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f0f0ff"}
            onMouseLeave={e => e.currentTarget.style.color = "#9090b0"}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* ── HERO or CHAT ── */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {showHero ? (
          <HeroView onSend={handleSend} />
        ) : (
          <div style={{
            padding: "16px 16px",
            display: "flex", flexDirection: "column",
            alignItems: "stretch", gap: 0,
          }}>
            {(selectedChat?.messages || [])
              .filter(msg => msg && msg.role)
              .map((msg, idx) => (
                <Message key={idx} message={msg} />
              ))
            }
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── INPUT ── */}
      {!showHero && (
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          loading={loading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      )}
    </div>
  );
};

export default Chatbox;