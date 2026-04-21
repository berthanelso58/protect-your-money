import React from 'react';

export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  return (
    <div className="relative mx-auto border-[#1c1c1e] bg-[#000] border-[12px] rounded-[4rem] h-[680px] w-[320px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-8 z-50 pointer-events-none ios-status-bar">
        <span className="text-black text-[14px] font-semibold tracking-tight">{timeStr}</span>
        
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-24 bg-black rounded-full flex items-center justify-center gap-1.5 shadow-inner">
          <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
          <div className="w-10 h-1 bg-white/10 rounded-full"></div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Signal */}
          <div className="flex items-end gap-[1px] h-3">
            <div className="w-[3px] h-[4px] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[6px] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[8px] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[10px] bg-black/30 rounded-[0.5px]"></div>
          </div>
          {/* Wifi */}
          <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21l-12-18h24z" opacity="0.1" />
            <path d="M12 21l-8-12h16z" />
          </svg>
          {/* Battery */}
          <div className="w-6 h-3 border border-black/30 rounded-[3px] relative flex items-center p-[1px]">
            <div className="h-full w-[80%] bg-black rounded-[1px]"></div>
            <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-black/30 rounded-r-[1px]"></div>
          </div>
        </div>
      </div>

      <div className="rounded-[3.2rem] overflow-hidden w-full h-full bg-[#f2f2f7] flex flex-col relative">
        <div className="flex-1 overflow-y-auto pt-11 pb-4">
          {children}
        </div>
        {/* iOS Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-black/10 rounded-full"></div>
      </div>
    </div>
  );
};