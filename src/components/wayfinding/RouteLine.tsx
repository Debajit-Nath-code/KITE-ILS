import React from 'react';

export interface RouteLineProps {
  points: { x: number; y: number }[];
  isNavigating?: boolean;
  activeSegmentIndex?: number;
}

export const RouteLine: React.FC<RouteLineProps> = ({
  points,
  isNavigating = false,
  activeSegmentIndex,
}) => {
  if (!points || points.length < 2) return null;

  // Generate SVG orthogonal path with angular crisp edges
  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <g className="route-layer pointer-events-none select-none">
      <defs>
        {/* Pixel Arrow Marker for Route Direction */}
        <marker
          id="retro-route-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <polygon points="1,1 8,5 1,9 3,5" fill="#100E2D" stroke="#FF7138" strokeWidth="1" />
        </marker>

        {/* Active Step Arrow Marker */}
        <marker
          id="retro-active-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <polygon points="1,1 9,5 1,9 4,5" fill="#25C6B7" stroke="#100E2D" strokeWidth="1.5" />
        </marker>
      </defs>

      {/* 1. Dark Contrasting Underlay/Shadow Path (Gives physical depth on grid) */}
      <path
        d={pathD}
        fill="none"
        stroke="#100E2D"
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* 2. Vivid Orange Path Background (Crisp retro angular corridor line) */}
      <path
        d={pathD}
        fill="none"
        stroke="#FF7138"
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* 3. High-Contrast Inner Striping (Simulating pixelated directional guide) */}
      <path
        d={pathD}
        fill="none"
        stroke="#F5E8C8"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray="6 4"
        className={isNavigating ? "animate-[dash_1s_linear_infinite]" : undefined}
      />

      {/* 4. Active Segment Highlight (When walking or navigating a specific corridor step) */}
      {typeof activeSegmentIndex === 'number' && points[activeSegmentIndex] && points[activeSegmentIndex + 1] && (
        <g className="active-segment-highlight pointer-events-none">
          {/* Underlay */}
          <line
            x1={points[activeSegmentIndex].x}
            y1={points[activeSegmentIndex].y}
            x2={points[activeSegmentIndex + 1].x}
            y2={points[activeSegmentIndex + 1].y}
            stroke="#100E2D"
            strokeWidth="12"
            strokeLinecap="square"
          />
          {/* Bright Teal active stroke */}
          <line
            x1={points[activeSegmentIndex].x}
            y1={points[activeSegmentIndex].y}
            x2={points[activeSegmentIndex + 1].x}
            y2={points[activeSegmentIndex + 1].y}
            stroke="#25C6B7"
            strokeWidth="7"
            strokeLinecap="square"
            markerEnd="url(#retro-active-arrow)"
          />
          {/* Inner highlight */}
          <line
            x1={points[activeSegmentIndex].x}
            y1={points[activeSegmentIndex].y}
            x2={points[activeSegmentIndex + 1].x}
            y2={points[activeSegmentIndex + 1].y}
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </g>
      )}

      {/* 5. Directional Waypoint Square Pegs along Corridor Turns */}
      {points.map((pt, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === points.length - 1;

        if (isStart || isEnd) return null;

        return (
          <g key={`waypoint-${idx}`}>
            <rect
              x={pt.x - 4}
              y={pt.y - 4}
              width="8"
              height="8"
              fill="#100E2D"
            />
            <rect
              x={pt.x - 3}
              y={pt.y - 3}
              width="6"
              height="6"
              fill="#F5E8C8"
              stroke="#FF7138"
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </g>
  );
};
