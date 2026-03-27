import React from "react";
import { useNavigate } from "react-router-dom";

const PlanButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/pricing")}
      className="w-[190px] mb-3 ml-2 rounded-xl px-4 cursor-pointer
        bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600
        text-white flex flex-col items-start shadow-md
        hover:shadow-lg hover:scale-[1.01]
        transition-all duration-200 active:scale-[0.99]"
    >
      <span className="text-[12px] font-semibold flex items-center gap-2">
        🚀 Upgrade to Scale Pro
      </span>
      <span className="text-[8px] text-white/80 mt-0.5">
        Unlock faster models & premium features
      </span>
    </button>
  );
};

export default PlanButton;