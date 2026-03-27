import React from "react";
import { useAppContext } from "../context/Appcontext";

const actions = [
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "image", label: "Images", icon: "🖼️" },
  { id: "code", label: "Code", icon: "💻" },
  { id: "project", label: "Projects", icon: "📁" },
];

const SidebarActions = () => {
  const { setSelectedChat, setChatMode } = useAppContext();

  const handleClick = (mode) => {
    setChatMode(mode);
    setSelectedChat(null);
  };

  return (
    <div className="px-4 mt-3">
      <p className="text-xs text-white/30 mb-2">Quick actions</p>
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => handleClick(a.id)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                     hover:bg-white/5 text-white/60 hover:text-white/90 text-left transition-colors"
        >
          <span>{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SidebarActions;