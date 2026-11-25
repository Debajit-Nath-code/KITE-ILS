import React from 'react';
import {
  ShelfCoordinate,
  ShelfPartition,
  MapLandmark,
  LibraryFloor,
  WayfindingRoute,
} from '../../types';
import { ShelfMarker } from './ShelfMarker';
import { RouteLine } from './RouteLine';
import { CurrentPosition } from './CurrentPosition';

export interface FloorPlanProps {
  floor: LibraryFloor;
  shelves: ShelfCoordinate[];
  landmarks: MapLandmark[];
  destinationShelfId?: string;
  selectedPartitionId?: string;
  route?: WayfindingRoute;
  currentPosition?: { x: number; y: number; floor: LibraryFloor };
  isNavigating?: boolean;
  activeStepIndex?: number;
  onSelectShelf?: (shelf: ShelfCoordinate, partition?: ShelfPartition) => void;
  className?: string;
}

const StudyDeskSvg: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({
  x,
  y,
  w = 124,
  h = 28,
}) => {
  const chairOffsets = [-42, -14, 14, 42];
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* 4 Chairs Above */}
      {chairOffsets.map((cx, idx) => (
        <rect
          key={`top-${idx}`}
          x={cx - 5}
          y={-h / 2 - 9}
          width="10"
          height="6"
          fill="#25C6B7"
          stroke="#100E2D"
          strokeWidth="1.2"
        />
      ))}

      {/* Desk Shadow */}
      <rect x={-w / 2 + 3} y={-h / 2 + 3} width={w} height={h} fill="#0A081D" />

      {/* Desk Surface */}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="#25C6B7"
        stroke="#100E2D"
        strokeWidth="2"
      />
      {/* Inset highlight */}
      <line
        x1={-w / 2 + 2}
        y1={-h / 2 + 2}
        x2={w / 2 - 2}
        y2={-h / 2 + 2}
        stroke="#A4F4EC"
        strokeWidth="1"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fill="#100E2D"
        className="font-pixel text-[8px] font-bold tracking-wider pointer-events-none select-none"
      >
        DESK
      </text>

      {/* 4 Chairs Below */}
      {chairOffsets.map((cx, idx) => (
        <rect
          key={`bot-${idx}`}
          x={cx - 5}
          y={h / 2 + 3}
          width="10"
          height="6"
          fill="#25C6B7"
          stroke="#100E2D"
          strokeWidth="1.2"
        />
      ))}
    </g>
  );
};

export const FloorPlan: React.FC<FloorPlanProps> = ({
  floor,
  shelves,
  landmarks,
  destinationShelfId,
  selectedPartitionId,
  route,
  currentPosition,
  isNavigating = false,
  activeStepIndex = 0,
  onSelectShelf,
  className = '',
}) => {
  const floorShelves = shelves.filter((s) => s.floor === floor);
  const floorDesks = landmarks.filter((l) => l.floor === floor && l.type === 'study_desk');
  const routePoints = route?.pathByFloor?.[floor] || [];

  let activeFloorSegmentIndex: number | undefined = undefined;
  if (isNavigating && route && typeof activeStepIndex === 'number') {
    const currentStep = route.steps[activeStepIndex];
    if (currentStep && currentStep.floor === floor) {
      const stepsOnThisFloor = route.steps.filter((s) => s.floor === floor);
      const stepIdxOnFloor = stepsOnThisFloor.findIndex(
        (s) => s.stepNumber === currentStep.stepNumber
      );
      if (stepIdxOnFloor >= 0 && routePoints.length > 1) {
        activeFloorSegmentIndex = Math.min(stepIdxOnFloor, routePoints.length - 2);
      }
    }
  }

  return (
    <div
      className={`relative w-full max-w-[720px] mx-auto aspect-[4/5] bg-[#100E2D] rounded-none overflow-hidden border-4 border-[#17132D] shadow-[8px_8px_0px_#17132D] select-none ${className}`}
    >
      {/* Retro OS Window Title Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#7850C8] border-b-2 border-[#100E2D] flex items-center justify-between px-3 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#FF7138] border border-[#100E2D]" />
          <div className="w-2.5 h-2.5 bg-[#F5E8C8] border border-[#100E2D]" />
          <div className="w-2.5 h-2.5 bg-[#25C6B7] border border-[#100E2D]" />
          <span className="font-pixel text-[8px] text-[#F5E8C8] uppercase tracking-wider ml-1">
            FLOOR_0{floor}.MAP // ACTUAL BLUEPRINT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] font-bold text-[#25C6B7] bg-[#100E2D] px-1.5 py-0.5 border border-[#100E2D]">
            {floorShelves.length} RACKS · {floorShelves.length * 5} BAYS
          </span>
          <span className="font-pixel text-[7px] text-[#F5E8C8] bg-[#100E2D] px-1 border border-[#100E2D]">
            [X]
          </span>
        </div>
      </div>

      {/* SVG Canvas Map (800x1000 Portrait matching uploaded library blueprint) */}
      <svg
        className="w-full h-full pt-7"
        viewBox="0 0 800 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="retro-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#25234A" strokeWidth="1" />
          </pattern>
          <pattern id="retro-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="#3A366E"
              strokeWidth="1.5"
              opacity="0.6"
            />
          </pattern>
          <pattern
            id="retro-stairs-pattern"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="5" x2="10" y2="5" stroke="#F5E8C8" strokeWidth="1.5" opacity="0.65" />
          </pattern>
        </defs>

        {/* 1. ARCHITECTURAL BASE & TECHNICAL GRID */}
        <rect width="800" height="1000" fill="#100E2D" />
        <rect width="800" height="1000" fill="url(#retro-grid-pattern)" />
        <rect width="800" height="1000" fill="url(#retro-grid-major)" />

        {/* Coordinate Corner Markers */}
        <text x="16" y="28" fill="#454879" className="font-mono text-[9px] font-bold">
          000,000
        </text>
        <text x="784" y="28" textAnchor="end" fill="#454879" className="font-mono text-[9px] font-bold">
          800,000
        </text>
        <text x="16" y="984" fill="#454879" className="font-mono text-[9px] font-bold">
          000,999
        </text>
        <text x="784" y="984" textAnchor="end" fill="#454879" className="font-mono text-[9px] font-bold">
          LIBRARY FL-0{floor}
        </text>

        {/* ================================================================= */}
        {/* FLOOR 1 ARCHITECTURAL BLUEPRINT                                   */}
        {/* ================================================================= */}
        {floor === 1 ? (
          <g id="floor-1-architecture">
            {/* Building Perimeter Drop Shadow */}
            <rect x="65" y="55" width="680" height="890" fill="#0A081D" />

            {/* Building Floor Slab */}
            <rect x="60" y="50" width="680" height="890" fill="#17132D" />

            {/* Subtle Walkway / Corridor Tracks */}
            <g opacity="0.55">
              {/* Main East-Center Concourse */}
              <rect x="520" y="140" width="65" height="700" fill="#1C1844" />
              {/* North Cross Passage */}
              <rect x="120" y="206" width="465" height="40" fill="#1C1844" />
              {/* South Cross Passage */}
              <rect x="120" y="692" width="465" height="42" fill="#1C1844" />
              {/* West Wing Inner Aisle */}
              <rect x="206" y="240" width="32" height="470" fill="#1C1844" />
              <line
                x1="548"
                y1="155"
                x2="548"
                y2="825"
                stroke="#25C6B7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.45"
              />
            </g>

            {/* Building Outer Walls (with Entrance Doorway Opening on East-Top) */}
            <path
              d="M 60 50 L 740 50 L 740 135 M 740 215 L 740 940 L 60 940 Z"
              fill="none"
              stroke="#7850C8"
              strokeWidth="5"
            />
            {/* Entrance Vestibule Partition Wall */}
            <line x1="680" y1="135" x2="740" y2="135" stroke="#7850C8" strokeWidth="4" />

            {/* 1. TOP-LEFT: COMPUTER AREA (Inverted-U Alcove) */}
            <g id="f1-computer-area">
              <path
                d="M 62 52 L 275 52 L 275 165 L 230 165 L 230 98 L 105 98 L 105 215 L 62 215 Z"
                fill="#FFD83D"
                stroke="#100E2D"
                strokeWidth="3"
              />
              <text
                x="168"
                y="82"
                textAnchor="middle"
                fill="#100E2D"
                className="font-pixel text-[8px] font-bold uppercase"
              >
                COMPUTER AREA
              </text>
            </g>

            {/* 2. TOP-CENTER: NORTH CABIN */}
            <g id="f1-cabin-north">
              <rect x="313" y="55" width="155" height="70" fill="#0A081D" />
              <rect
                x="310"
                y="52"
                width="155"
                height="70"
                fill="#FF7138"
                stroke="#100E2D"
                strokeWidth="3"
              />
              <text
                x="387.5"
                y="93"
                textAnchor="middle"
                fill="#100E2D"
                className="font-pixel text-[10px] font-bold uppercase"
              >
                CABIN
              </text>
            </g>

            {/* 3. TOP-RIGHT: CHECK IN */}
            <g id="f1-check-in">
              <path
                d="M 505 78 L 602 78 L 602 52 L 650 52 L 650 125 L 505 125 Z"
                fill="#454879"
                stroke="#F5E8C8"
                strokeWidth="2.5"
              />
              <text
                x="577"
                y="108"
                textAnchor="middle"
                fill="#F5E8C8"
                className="font-pixel text-[9px] font-bold uppercase"
              >
                CHECK IN
              </text>
            </g>

            {/* 4. ENTRANCE DOORWAY & INWARD ARROW */}
            <g id="f1-entrance">
              <rect
                x="692"
                y="145"
                width="82"
                height="20"
                fill="#25C6B7"
                stroke="#100E2D"
                strokeWidth="2"
              />
              <text
                x="733"
                y="159"
                textAnchor="middle"
                fill="#100E2D"
                className="font-pixel text-[7px] font-bold"
              >
                ENTRANCE
              </text>
              {/* Inward Arrow */}
              <line
                x1="770"
                y1="182"
                x2="660"
                y2="182"
                stroke="#25C6B7"
                strokeWidth="3"
              />
              <polygon points="660,182 674,174 674,190" fill="#25C6B7" />
            </g>

            {/* 5. EAST SIDE: TALL HELP DESK */}
            <g id="f1-help-desk">
              <rect x="610" y="230" width="130" height="360" fill="#0A081D" />
              <rect
                x="605"
                y="225"
                width="133"
                height="360"
                fill="#43C95E"
                stroke="#100E2D"
                strokeWidth="3"
              />
              <rect
                x="612"
                y="232"
                width="119"
                height="346"
                fill="none"
                stroke="#100E2D"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x="672"
                y="405"
                textAnchor="middle"
                fill="#100E2D"
                transform="rotate(-90 672 405)"
                className="font-pixel text-[13px] font-bold tracking-widest uppercase"
              >
                HELP DESK
              </text>
            </g>

            {/* 6. CURVED GRAND STAIRCASE (Dividing West & Center Wings) */}
            <g id="f1-curved-stairs">
              {/* Upper Curved Flight */}
              <path
                d="M 325 245 Q 230 265 230 390 L 278 390 Q 278 302 332 292 Z"
                fill="#231E48"
                stroke="#F5E8C8"
                strokeWidth="2.5"
              />
              {/* Upper Curved Treads */}
              <line x1="312" y1="250" x2="318" y2="294" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="290" y1="262" x2="304" y2="302" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="268" y1="282" x2="292" y2="314" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="248" y1="308" x2="284" y2="332" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="236" y1="340" x2="280" y2="354" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="232" y1="370" x2="278" y2="375" stroke="#F5E8C8" strokeWidth="1.5" />

              {/* Middle Landing & Vertical STAIRS Label */}
              <rect
                x="230"
                y="390"
                width="48"
                height="115"
                fill="#100E2D"
                stroke="#F5E8C8"
                strokeWidth="2.5"
              />
              <text
                x="254"
                y="448"
                textAnchor="middle"
                fill="#FF7138"
                transform="rotate(-90 254 448)"
                className="font-pixel text-[10px] font-bold tracking-widest"
              >
                STAIRS
              </text>

              {/* Lower Curved Flight */}
              <path
                d="M 230 505 Q 230 685 405 695 L 405 645 Q 278 638 278 505 Z"
                fill="#231E48"
                stroke="#F5E8C8"
                strokeWidth="2.5"
              />
              {/* Lower Curved Treads */}
              <line x1="232" y1="530" x2="278" y2="526" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="236" y1="560" x2="280" y2="548" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="248" y1="595" x2="288" y2="574" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="268" y1="628" x2="302" y2="598" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="298" y1="658" x2="324" y2="620" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="336" y1="678" x2="352" y2="634" stroke="#F5E8C8" strokeWidth="1.5" />
              <line x1="372" y1="690" x2="380" y2="642" stroke="#F5E8C8" strokeWidth="1.5" />

              {/* Retro Purple Direction Arrows inside Stairs */}
              <path
                d="M 320 270 Q 260 288 254 365"
                fill="none"
                stroke="#7850C8"
                strokeWidth="2.5"
              />
              <polygon points="254,372 248,360 260,360" fill="#7850C8" />
              <path
                d="M 412 672 Q 262 664 254 540"
                fill="none"
                stroke="#7850C8"
                strokeWidth="2.5"
              />
              <polygon points="254,532 248,544 260,544" fill="#7850C8" />
            </g>

            {/* 7. BOTTOM-CENTER: SOUTH CABIN */}
            <g id="f1-cabin-south">
              <rect x="358" y="858" width="160" height="82" fill="#0A081D" />
              <rect
                x="355"
                y="855"
                width="160"
                height="82"
                fill="#FF7138"
                stroke="#100E2D"
                strokeWidth="3"
              />
              <text
                x="435"
                y="902"
                textAnchor="middle"
                fill="#100E2D"
                className="font-pixel text-[10px] font-bold uppercase"
              >
                CABIN
              </text>
            </g>
          </g>
        ) : (
          /* =============================================================== */
          /* FLOOR 2 ARCHITECTURAL BLUEPRINT                                 */
          /* =============================================================== */
          <g id="floor-2-architecture">
            {/* Building Perimeter Drop Shadow */}
            <rect x="140" y="55" width="570" height="890" fill="#0A081D" />

            {/* Main Hall Slab */}
            <rect x="135" y="50" width="570" height="890" fill="#17132D" />

            {/* Exterior Left Stairwell Zone */}
            <rect x="48" y="50" width="87" height="890" fill="#141133" />
            <line x1="48" y1="50" x2="48" y2="940" stroke="#7850C8" strokeWidth="4" />

            {/* Subtle Floor 2 Walkways */}
            <g opacity="0.55">
              {/* West Aisle */}
              <rect x="250" y="130" width="55" height="740" fill="#1C1844" />
              {/* East Aisle */}
              <rect x="535" y="130" width="55" height="740" fill="#1C1844" />
              {/* North Stair Corridor */}
              <rect x="90" y="218" width="540" height="44" fill="#1C1844" />
              {/* South Stair Corridor */}
              <rect x="90" y="728" width="540" height="44" fill="#1C1844" />
              <line
                x1="275"
                y1="145"
                x2="275"
                y2="855"
                stroke="#25C6B7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <line
                x1="565"
                y1="145"
                x2="565"
                y2="855"
                stroke="#25C6B7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            </g>

            {/* Main Hall Outer Walls with TWO West Stairway Openings */}
            <path
              d="M 135 198 L 135 50 L 705 50 L 705 940 L 135 940 L 135 788 M 135 280 L 135 708"
              fill="none"
              stroke="#7850C8"
              strokeWidth="5"
            />

            {/* Upper Stairway Entry & Arrow */}
            <g id="f2-stairs-upper">
              <rect
                x="62"
                y="200"
                width="68"
                height="78"
                fill="#1C1844"
                stroke="#F5E8C8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect x="62" y="200" width="68" height="78" fill="url(#retro-stairs-pattern)" />
              <text
                x="88"
                y="120"
                textAnchor="middle"
                fill="#F5E8C8"
                transform="rotate(-90 88 120)"
                className="font-pixel text-[10px] font-bold tracking-wider"
              >
                STAIRS
              </text>
              <line x1="104" y1="90" x2="104" y2="215" stroke="#7850C8" strokeWidth="3" />
              <polygon points="104,225 96,208 112,208" fill="#7850C8" />
            </g>

            {/* Lower Stairway Entry & Arrow */}
            <g id="f2-stairs-lower">
              <rect
                x="62"
                y="710"
                width="68"
                height="78"
                fill="#1C1844"
                stroke="#F5E8C8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect x="62" y="710" width="68" height="78" fill="url(#retro-stairs-pattern)" />
              <text
                x="88"
                y="870"
                textAnchor="middle"
                fill="#F5E8C8"
                transform="rotate(-90 88 870)"
                className="font-pixel text-[10px] font-bold tracking-wider"
              >
                STAIRS
              </text>
              <line x1="104" y1="895" x2="104" y2="770" stroke="#7850C8" strokeWidth="3" />
              <polygon points="104,760 96,777 112,777" fill="#7850C8" />
            </g>
          </g>
        )}

        {/* ================================================================= */}
        {/* STUDY DESKS WITH 4+4 CHAIRS (Matching Blueprints)                 */}
        {/* ================================================================= */}
        {floorDesks.map((desk) => (
          <StudyDeskSvg
            key={desk.id}
            x={desk.x}
            y={desk.y}
            w={desk.width || 124}
            h={desk.height || 28}
          />
        ))}

        {/* ================================================================= */}
        {/* CORRIDOR ROUTE LAYER                                              */}
        {/* ================================================================= */}
        {routePoints.length > 1 && (
          <RouteLine
            points={routePoints}
            isNavigating={isNavigating}
            activeSegmentIndex={activeFloorSegmentIndex}
          />
        )}

        {/* ================================================================= */}
        {/* SHELVES LAYER (Every Shelf ID + 5 Separated Partitions)           */}
        {/* ================================================================= */}
        {floorShelves.map((shelf) => (
          <ShelfMarker
            key={shelf.shelfId}
            shelf={shelf}
            isDestination={shelf.shelfId === destinationShelfId}
            selectedPartitionId={selectedPartitionId}
            onClick={onSelectShelf}
          />
        ))}

        {/* ================================================================= */}
        {/* CURRENT POSITION ("YOU ARE HERE" Pixel Beacon)                    */}
        {/* ================================================================= */}
        {currentPosition && currentPosition.floor === floor && (
          <CurrentPosition
            x={currentPosition.x}
            y={currentPosition.y}
            isNavigating={isNavigating}
          />
        )}

        {/* Floor Level Watermark */}
        <g transform="translate(715, 960)">
          <rect x="-80" y="-18" width="76" height="20" fill="#17132D" stroke="#7850C8" strokeWidth="1.5" />
          <text
            x="-42"
            y="-4"
            textAnchor="middle"
            fill="#F5E8C8"
            className="font-pixel text-[8px] font-bold tracking-wider select-none pointer-events-none"
          >
            FL_0{floor}
          </text>
        </g>
      </svg>
    </div>
  );
};
