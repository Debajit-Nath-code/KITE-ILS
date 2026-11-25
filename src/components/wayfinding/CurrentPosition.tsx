import React from 'react';

export interface CurrentPositionProps {
  x: number;
  y: number;
  label?: string;
  isNavigating?: boolean;
}

export const CurrentPosition: React.FC<CurrentPositionProps> = ({
  x,
  y,
  label = 'YOU ARE HERE',
  isNavigating = false,
}) => {
  return (
    <g
      className="current-position-marker pointer-events-none select-none"
      transform={`translate(${x}, ${y})`}
    >
      {/* 1. Retro Pixel Crosshair Rings */}
      <rect
        x="-16"
        y="-16"
        width="32"
        height="32"
        fill="none"
        stroke="#25C6B7"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        className="animate-spin origin-center"
        style={{ animationDuration: '6s' }}
      />

      {/* Crosshair Tick Marks */}
      <line x1="-22" y1="0" x2="-14" y2="0" stroke="#25C6B7" strokeWidth="2" />
      <line x1="14" y1="0" x2="22" y2="0" stroke="#25C6B7" strokeWidth="2" />
      <line x1="0" y1="-22" x2="0" y2="-14" stroke="#25C6B7" strokeWidth="2" />
      <line x1="0" y1="14" x2="0" y2="22" stroke="#25C6B7" strokeWidth="2" />

      {/* 2. Pixel Drop Shadow */}
      <rect x="-6" y="-6" width="16" height="16" fill="#100E2D" />

      {/* 3. Core Pixel Center Block - Bright Teal */}
      <rect
        x="-7"
        y="-7"
        width="14"
        height="14"
        fill="#25C6B7"
        stroke="#100E2D"
        strokeWidth="2"
      />
      <rect x="-3" y="-3" width="6" height="6" fill="#F5E8C8" />

      {/* 4. Directional Heading Indicator if Navigating */}
      {isNavigating && (
        <polygon
          points="0,-16 6,-8 -6,-8"
          fill="#FF7138"
          stroke="#100E2D"
          strokeWidth="1.5"
        />
      )}

      {/* 5. "YOU ARE HERE" Retro Computer Tag Badge */}
      <g transform="translate(0, -28)">
        <rect
          x="-50"
          y="-13"
          width="100"
          height="16"
          fill="#F5E8C8"
          stroke="#100E2D"
          strokeWidth="2"
        />
        <text
          x="0"
          y="-2"
          textAnchor="middle"
          fill="#100E2D"
          className="font-pixel text-[6px] tracking-wider font-bold"
        >
          {label}
        </text>
      </g>
    </g>
  );
};
