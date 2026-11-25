import React from 'react';

interface KiteLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const KiteLogo: React.FC<KiteLogoProps> = ({ 
  className = '', 
  size = 28, 
  showText = true 
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Neo-brutalist Kite mark with thick black stroke and vivid offset planes */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[2px_2px_0px_#111111]"
        aria-hidden="true"
      >
        {/* Main Diamond facet - Electric Blue */}
        <path
          d="M16 2L30 14L16 30L2 14L16 2Z"
          fill="#FFD83D"
          stroke="#111111"
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />
        {/* Right facet - Orange */}
        <path
          d="M16 2L30 14L16 18L16 2Z"
          fill="#F26B32"
          stroke="#111111"
          strokeWidth="2"
        />
        {/* Bottom facet - Electric Blue */}
        <path
          d="M16 18L30 14L16 30L16 18Z"
          fill="#24A9C7"
          stroke="#111111"
          strokeWidth="2"
        />
        {/* Center line */}
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="30"
          stroke="#111111"
          strokeWidth="2.5"
        />
      </svg>

      {showText && (
        <div className="flex items-center gap-1.5 select-none">
          <span className="font-heading text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#111111]">
            Kite
          </span>
          <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#111111] bg-[#FFD83D] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] px-1.5 py-0.2 uppercase">
            ILS
          </span>
        </div>
      )}
    </div>
  );
};
