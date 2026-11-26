import React from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Footprints, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Layers, 
  ChevronRight,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { WayfindingRoute, RouteStep, LibraryFloor, ShelfCoordinate, ShelfPartition } from '../../types';
import { buildPartitions } from '../../data/wayfindingData';

export interface NavigationPanelProps {
  route: WayfindingRoute;
  selectedShelf?: ShelfCoordinate;
  selectedPartitionId?: string;
  onSelectPartition?: (partition: ShelfPartition) => void;
  activeFloor: LibraryFloor;
  currentStepIndex: number;
  isNavigating: boolean;
  isAutoWalking: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSelectStep: (index: number) => void;
  onToggleAutoWalk: () => void;
  onSwitchFloor: (floor: LibraryFloor) => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  route,
  selectedShelf,
  selectedPartitionId,
  onSelectPartition,
  activeFloor,
  currentStepIndex,
  isNavigating,
  isAutoWalking,
  onStartNavigation,
  onStopNavigation,
  onNextStep,
  onPrevStep,
  onSelectStep,
  onToggleAutoWalk,
  onSwitchFloor,
}) => {
  const currentStep = route.steps[currentStepIndex] || route.steps[0];
  const isFloorMismatch = currentStep && currentStep.floor !== activeFloor;
  const partitions =
    selectedShelf?.partitions && selectedShelf.partitions.length > 0
      ? selectedShelf.partitions
      : buildPartitions(route.destinationShelfId);
  const activePartition = partitions.find((p) => p.partitionId === selectedPartitionId);

  return (
    <div className="space-y-4">
      {/* 1. PRIMARY RETRO CREAM INFORMATION PANEL */}
      <div className="bg-[#F5E8C8] text-[#17132D] border-4 border-[#17132D] shadow-[6px_6px_0px_#17132D] overflow-hidden">
        {/* Retro Header Strip */}
        <div className="p-3 bg-[#7850C8] text-[#F5E8C8] border-b-3 border-[#17132D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FF7138] border border-[#17132D]" />
            <span className="font-pixel text-[8px] uppercase tracking-wider font-bold">
              DESTINATION PROTOCOL // KITE-OS
            </span>
          </div>
          <span className="font-mono text-[10px] bg-[#100E2D] text-[#25C6B7] px-2 py-0.5 border border-[#17132D] font-bold">
            {route.estimatedWalkingTime}
          </span>
        </div>

        {/* Monograph & Destination Details Box */}
        <div className="p-4 border-b-3 border-[#17132D] bg-[#FFFDF9]/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="font-pixel text-[7px] text-[#7850C8] uppercase tracking-wider font-bold block mb-1">
                ★ DESTINATION FOUND
              </span>
              <h3 className="font-heading text-base font-extrabold text-[#17132D] uppercase leading-snug line-clamp-2">
                {route.destinationBookTitle}
              </h3>
            </div>
            <div className="text-right shrink-0 bg-[#FF7138] text-[#100E2D] p-2 border-2 border-[#17132D] shadow-[2px_2px_0px_#17132D]">
              <span className="font-pixel text-[7px] block uppercase font-bold text-[#100E2D]/80">SHELF</span>
              <span className="font-mono text-xs font-black tracking-wider block">{route.destinationShelfId}</span>
            </div>
          </div>

          {/* Metadata Grid (Retro Teletext style) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-[#17132D]/20 text-xs font-mono">
            <div className="bg-[#100E2D] text-[#F5E8C8] p-2 border border-[#17132D]">
              <span className="text-[8px] font-pixel text-[#25C6B7] block mb-0.5">FLOOR LEVEL:</span>
              <span className="font-bold text-xs">0{route.destinationFloor} // MAIN HALL</span>
            </div>
            <div className="bg-[#100E2D] text-[#F5E8C8] p-2 border border-[#17132D]">
              <span className="text-[8px] font-pixel text-[#FF7138] block mb-0.5">DISTANCE:</span>
              <span className="font-bold text-xs">{route.totalDistanceMeters} METERS WALK</span>
            </div>
          </div>

          {/* Separated Shelf Partitions Breakdown */}
          <div className="pt-2 border-t-2 border-[#17132D]/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-pixel text-[7px] text-[#17132D] uppercase font-bold">
                SEPARATED PARTITIONS (5 BAYS)
              </span>
              <span className="font-bold text-[#7850C8]">
                {activePartition ? activePartition.partitionId : `${route.destinationShelfId}-A..E`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {partitions.map((part) => {
                const isPartActive = selectedPartitionId === part.partitionId;
                return (
                  <button
                    key={part.partitionId}
                    type="button"
                    onClick={() => onSelectPartition && onSelectPartition(part)}
                    title={`${part.partitionId}: ${part.label || 'Shelf Bay'}`}
                    className={`min-h-[44px] md:min-h-0 py-1.5 border-2 border-[#17132D] font-mono text-[10px] font-black transition-all cursor-pointer ${
                      isPartActive
                        ? 'bg-[#25C6B7] text-[#100E2D] shadow-[2px_2px_0px_#17132D] -translate-y-0.5'
                        : 'bg-[#100E2D] text-[#F5E8C8] hover:bg-[#7850C8]'
                    }`}
                  >
                    {part.code}
                  </button>
                );
              })}
            </div>
            {activePartition && (
              <div className="px-2 py-1 bg-[#25C6B7]/25 border border-[#17132D] font-mono text-[10px] text-[#17132D] flex items-center justify-between">
                <span className="font-bold">{activePartition.partitionId}</span>
                <span className="truncate ml-2">{activePartition.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. ROUTE INSTRUCTIONS LIST */}
        <div className="p-4 space-y-3 bg-[#F5E8C8]">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#17132D]">
            <span className="font-pixel text-[8px] text-[#17132D] uppercase font-bold flex items-center gap-1.5">
              <span>▶</span> ROUTE INSTRUCTIONS ({route.steps.length})
            </span>
            <span className="font-mono text-[9px] font-bold text-[#7850C8]">
              STEP {currentStepIndex + 1}/{route.steps.length}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {route.steps.map((step, idx) => {
              const isActive = isNavigating && currentStepIndex === idx;
              const isPast = isNavigating && currentStepIndex > idx;

              return (
                <div
                  key={step.stepNumber}
                  onClick={() => onSelectStep(idx)}
                  className={`
                    p-2.5 border-2 text-xs cursor-pointer transition-all duration-75 flex items-start gap-2.5
                    ${
                      isActive
                        ? 'bg-[#FF7138] text-[#100E2D] border-[#100E2D] shadow-[3px_3px_0px_#100E2D] -translate-x-0.5 -translate-y-0.5 font-bold'
                        : isPast
                        ? 'bg-[#100E2D]/10 border-[#17132D]/40 text-[#17132D]/60'
                        : 'bg-white text-[#17132D] border-[#17132D] hover:bg-[#FFE2B8]'
                    }
                  `}
                >
                  {/* Pixel Step Number Badge */}
                  <div
                    className={`
                      w-6 h-6 border-2 border-[#17132D] flex items-center justify-center font-mono text-[10px] font-black shrink-0
                      ${
                        isActive
                          ? 'bg-[#100E2D] text-[#FF7138]'
                          : isPast
                          ? 'bg-[#25C6B7] text-[#100E2D]'
                          : 'bg-[#F5E8C8] text-[#17132D]'
                      }
                    `}
                  >
                    {isPast ? '✓' : `0${step.stepNumber}`}
                  </div>

                  {/* Instruction text */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-xs leading-snug ${isActive ? 'font-black' : 'font-semibold'}`}>
                      {step.instruction}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] font-mono opacity-80">
                      <span>FL-0{step.floor}</span>
                      {step.landmark && (
                        <>
                          <span>·</span>
                          <span className="truncate">{step.landmark}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floor Warning Notice if Step is on different floor */}
          {isNavigating && isFloorMismatch && (
            <div className="p-3 bg-[#100E2D] text-[#F5E8C8] border-2 border-[#FF7138] flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_#17132D]">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#FF7138] font-bold">!</span>
                <span>Next segment on <strong>Floor {currentStep.floor}</strong></span>
              </div>
              <button
                type="button"
                className="min-h-[40px] md:min-h-0 px-2.5 md:px-2 py-1.5 md:py-1 bg-[#25C6B7] text-[#100E2D] font-pixel text-[7px] uppercase font-bold border border-[#100E2D] hover:bg-white cursor-pointer"
                onClick={() => onSwitchFloor(currentStep.floor)}
              >
                GOTO FL_{currentStep.floor}
              </button>
            </div>
          )}
        </div>

        {/* 3. RETRO CONTROLS FOOTER */}
        <div className="p-4 bg-[#100E2D] border-t-3 border-[#17132D] space-y-2.5">
          {!isNavigating ? (
            <button
              type="button"
              className="w-full h-12 bg-[#FF7138] text-[#100E2D] border-3 border-[#100E2D] shadow-[4px_4px_0px_#F5E8C8] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#F5E8C8] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#F5E8C8] font-pixel text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-75"
              onClick={onStartNavigation}
            >
              <span>▶</span> [ START NAVIGATION ]
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-1/2 min-h-[44px] md:min-h-0 h-11 md:h-10 bg-[#F5E8C8] text-[#100E2D] border-2 border-[#100E2D] shadow-[3px_3px_0px_#7850C8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 font-pixel text-[8px] font-bold uppercase disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  onClick={onPrevStep}
                  disabled={currentStepIndex === 0}
                >
                  ◄ PREV STEP
                </button>
                <button
                  type="button"
                  className="w-1/2 min-h-[44px] md:min-h-0 h-11 md:h-10 bg-[#FF7138] text-[#100E2D] border-2 border-[#100E2D] shadow-[3px_3px_0px_#F5E8C8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 font-pixel text-[8px] font-bold uppercase disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  onClick={onNextStep}
                  disabled={currentStepIndex === route.steps.length - 1}
                >
                  {currentStepIndex === route.steps.length - 1 ? '★ ARRIVED!' : 'NEXT STEP ►'}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  className="min-h-[44px] md:min-h-0 px-3 md:px-2.5 py-2 md:py-1.5 bg-[#25C6B7] text-[#100E2D] font-pixel text-[7px] uppercase font-bold border border-[#100E2D] hover:bg-white cursor-pointer"
                  onClick={onToggleAutoWalk}
                >
                  {isAutoWalking ? '❚❚ PAUSE AUTO' : '▶ AUTO WALK'}
                </button>

                <button
                  type="button"
                  className="min-h-[44px] md:min-h-0 px-3 md:px-2.5 py-2 md:py-1.5 bg-[#7850C8] text-[#F5E8C8] font-pixel text-[7px] uppercase font-bold border border-[#100E2D] hover:bg-[#FF7138] hover:text-[#100E2D] cursor-pointer"
                  onClick={onStopNavigation}
                >
                  [ RESET ROUTE ]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
