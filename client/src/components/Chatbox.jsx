import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { useAppContext } from "../context/Appcontext";
import HeroView from "./HeroView";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

const Chatbox = ({ onMenuClick }) => {
  const {
    chats, setChats,
    selectedChat, setSelectedChat,
    chatMode, token, user, navigate,
    showHero, setShowHero,
    chatsReady,
  } = useAppContext();

  if (!chatsReady && user) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", width: "100%", background: "#06060e",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "3px solid rgba(163,112,247,0.2)",
          borderTop: "3px solid #a370f7",
          animation: "spin 0.8s linear infinite",
        }}/>
      </div>
    );
  }

  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [selectedModel, setSelectedModel] = useState("Scale Fast");
  const [streamingText, setStreamingText] = useState("");
  const bottomRef                         = useRef(null);

  const generateTitle = (text) =>
    text ? text.split(" ").slice(0, 4).join(" ") : "New Chat";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages, streamingText]);

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

    if (!chat) {
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

    const tempId = chat._id;

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
    setStreamingText("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/ai`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: tempId,
            prompt: prompt || "User sent a file attachment",
          }),
        }
      );

      if (!response.ok) throw new Error("Stream request failed");

      const reader   = response.body.getReader();
      const decoder  = new TextDecoder();
      let   buffer   = "";
      let   fullText = "";
      let   realId   = tempId;
      let   realName = updatedChat.name;

      // ✅ Hide typing indicator as soon as stream starts
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));

            if (parsed.delta) {
              fullText += parsed.delta;
              setStreamingText(fullText);
            }

            if (parsed.done) {
              realId   = parsed.chatId   || tempId;
              realName = parsed.chatName || updatedChat.name;
            }

            if (parsed.error) throw new Error(parsed.error);

          } catch {
            // skip malformed chunks
          }
        }
      }

      // ✅ Streaming done — commit final message to state
      const aiMessage = {
        role:      "assistant",
        content:   fullText,
        timestamp: Date.now(),
      };

      const chatWithReply = {
        ...updatedChat,
        _id:       realId,
        name:      realName,
        messages:  [...updatedChat.messages, aiMessage],
        updatedAt: new Date(),
      };

      setChats(prev => prev.map(c => c._id === tempId ? chatWithReply : c));
      setSelectedChat(chatWithReply);
      setStreamingText("");
      localStorage.setItem("last_chat_id", realId);

    } catch (error) {
      console.error("Stream failed:", error.message);
      setLoading(false);
      setStreamingText("");

      const aiMessage = {
        role:      "assistant",
        content:   "Something went wrong. Please try again.",
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
      setStreamingText("");
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", width: "100%",
      overflow: "hidden", background: "#06060e",
      fontFamily: "'Outfit', sans-serif",
      paddingTop:    "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      paddingLeft:   "env(safe-area-inset-left)",
      paddingRight:  "env(safe-area-inset-right)",
      boxSizing: "border-box",
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        minHeight: 50, padding: "8px 12px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#06060e", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        gap: 8, boxSizing: "border-box", width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
          <button
            onClick={onMenuClick}
            className="md:hidden"
            style={{
              background: "none", border: "none", color: "#9090b0",
              fontSize: "clamp(16px, 4vw, 20px)", cursor: "pointer",
              padding: "8px", display: "flex", alignItems: "center",
              flexShrink: 0, minWidth: 36, minHeight: 36,
            }}
          >☰</button>

          <span style={{
            fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 500,
            color: "#9090b0", overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", minWidth: 0, flex: 1,
          }}>
            {showHero ? "ScaleGPT" : selectedChat?.name || "Conversation"}
          </span>

          <span style={{
            fontSize: "clamp(9px, 2.5vw, 11px)", padding: "3px 7px",
            borderRadius: 20, background: "rgba(165,112,247,.12)",
            border: "1px solid rgba(165,112,247,.25)",
            color: "#a370f7", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap",
          }}>{selectedModel}</span>
        </div>

        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {["↗ Share", "⚙"].map(label => (
            <button key={label} style={{
              background: "#10101f", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 7, color: "#9090b0",
              fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 500,
              padding: "6px 8px", cursor: "pointer", flexShrink: 0,
              minHeight: 32, whiteSpace: "nowrap",
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
        WebkitOverflowScrolling: "touch",
      }}>
        {showHero ? (
          <HeroView onSend={handleSend} />
        ) : (
          <div style={{
            padding: "clamp(8px, 3vw, 16px)",
            display: "flex", flexDirection: "column",
            alignItems: "stretch", gap: 0,
            boxSizing: "border-box", width: "100%",
          }}>
            {(selectedChat?.messages || [])
              .filter(msg => msg && msg.role)
              .map((msg, idx) => (
                <Message key={idx} message={msg} />
              ))
            }

            {/* ✅ Typing indicator while waiting for stream to start */}
            {loading && <TypingIndicator />}

            {/* ✅ Streaming text appears word by word */}
            {streamingText && (
              <Message
                message={{
                  role:      "assistant",
                  content:   streamingText,
                  timestamp: Date.now(),
                }}
              />
            )}

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
          loading={loading || !!streamingText}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      )}
    </div>
  );
};

export default Chatbox;