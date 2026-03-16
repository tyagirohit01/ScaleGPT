import { motion } from "framer-motion";
import React from "react";

export default function PlanCard({ plan, active, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-xl p-4 border 
        ${active ? "bg-white/20 border-white" : "border-white/20"}
      `}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {plan.popular && (
          <span className="text-xs bg-yellow-300 text-black px-2 py-1 rounded-full">
            Most Popular
          </span>
        )}
      </div>

      <p className="text-sm opacity-80 mt-1">{plan.tagline}</p>
    </motion.div>
  );
}
