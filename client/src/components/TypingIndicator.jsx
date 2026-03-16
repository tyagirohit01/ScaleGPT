import React from "react"
export default function TypingIndicator() {
    return (
      <div className="flex gap-2.5">
        <div className="w-[27px] h-[27px] rounded-full grad-btn flex items-center justify-center text-[11px] font-black text-white shrink-0">S</div>
        <div>
          <div className="text-[10px] text-t3 mb-1 tracking-[0.5px] uppercase font-semibold">ScaleGPT</div>
          <div className="inline-flex items-center gap-1.5 bg-s2 rounded-[13px] rounded-tl-[4px] px-3.5 py-[11px]"
            style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-v2 animate-dot inline-block"/>
            <span className="w-1.5 h-1.5 rounded-full bg-v2 animate-dot2 inline-block"/>
            <span className="w-1.5 h-1.5 rounded-full bg-v2 animate-dot3 inline-block"/>
          </div>
        </div>
      </div>
    )
  }