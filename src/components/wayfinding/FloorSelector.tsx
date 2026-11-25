import React from 'react';
import { Layers, MapPin, Navigation } from 'lucide-react';
import { LibraryFloor } from '../../types';

export interface FloorSelectorProps {
  activeFloor: LibraryFloor;
  onSelectFloor: (floor: LibraryFloor) => void;
  destinationFloor?: LibraryFloor;
  currentFloor?: LibraryFloor;
  className?: string;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  activeFloor,
  onSelectFloor,
  destinationFloor,
  currentFloor,
  className = '',
}) => {
  const floors: { floor: LibraryFloor; code: string; label: string; sublabel: string }[] = [
    { floor: 1, code: 'FL-01', label: 'FLOOR 01', sublabel: 'ENTRANCE & PHYSICAL SCI' },
    { floor: 2, code: 'FL-02', label: 'FLOOR 02', sublabel: 'COMP SCI & ENGINEERING' },
  ];

  return (
    <div className={`bg-[#100E2D] p-1.5 border-3 border-[#17132D] shadow-[4px_4px_0px_#17132D] flex flex-wrap items-center gap-2 ${className}`}>
      <div className="px-2 py-1 bg-[#7850C8] border border-[#100E2D] hidden sm:flex items-center gap-1.5">
        <span className="w-2 h-2 bg-[#F5E8C8]" />
        <span className="font-pixel text-[8px] text-[#F5E8C8] uppercase tracking-wider">
          FLOOR_SELECT:
        </span>
      </div>

      {floors.map(({ floor, code, label, sublabel }) => {
        const isActive = activeFloor === floor;
        const isDestination = destinationFloor === floor;
        const isCurrent = currentFloor === floor;

        return (
          <button
            key={floor}
            type="button"
            onClick={() => onSelectFloor(floor)}
            className={`
              relative flex-1 py-2 px-3 sm:px-4 text-left transition-all duration-75 cursor-pointer border-2
              ${
                isActive
                  ? 'bg-[#FF7138] text-[#100E2D] border-[#100E2D] shadow-[3px_3px_0px_#100E2D] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-[#17132D] text-[#F5E8C8] border-[#25234A] hover:bg-[#25234A] hover:border-[#7850C8]'
              }
            `}
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-pixel text-[9px] sm:text-[10px] tracking-tight flex items-center gap-1.5 font-bold uppercase">
                <span className={isActive ? 'text-[#100E2D]' : 'text-[#25C6B7]'}>▶</span>
                <span>[ {label} ]</span>
              </span>

              {/* Floor Context Badges */}
              <div className="flex items-center gap-1">
                {isCurrent && (
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.2 border uppercase tracking-wider ${
                      isActive 
                        ? 'bg-[#100E2D] text-[#25C6B7] border-[#100E2D]' 
                        : 'bg-[#25C6B7] text-[#100E2D] border-[#100E2D]'
                    }`}
                    title="Current Position"
                  >
                    YOU
                  </span>
                )}
                {isDestination && (
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.2 border uppercase tracking-wider flex items-center gap-0.5 ${
                      isActive 
                        ? 'bg-[#F5E8C8] text-[#FF7138] border-[#100E2D]' 
                        : 'bg-[#FF7138] text-[#100E2D] border-[#100E2D]'
                    }`}
                    title="Target Shelf Destination"
                  >
                    ★ GOAL
                  </span>
                )}
              </div>
            </div>

            <span
              className={`block font-mono text-[9px] mt-1 truncate hidden sm:block ${
                isActive ? 'text-[#100E2D] font-bold' : 'text-[#F5E8C8]/60'
              }`}
            >
              {sublabel}
            </span>
          </button>
        );
      })}
    </div>
  );
};
