import React from 'react';
import { ShelfCoordinate, ShelfPartition } from '../../types';
import { buildPartitions } from '../../data/wayfindingData';

export interface ShelfMarkerProps {
  shelf: ShelfCoordinate;
  isDestination?: boolean;
  isSelected?: boolean;
  selectedPartitionId?: string;
  onClick?: (shelf: ShelfCoordinate, partition?: ShelfPartition) => void;
}

export const ShelfMarker: React.FC<ShelfMarkerProps> = ({
  shelf,
  isDestination = false,
  isSelected = false,
  selectedPartitionId,
  onClick,
}) => {
  const isVertical = shelf.orientation === 'vertical';
  const partitions =
    shelf.partitions && shelf.partitions.length > 0
      ? shelf.partitions
      : buildPartitions(shelf.shelfId);

  const count = partitions.length; // typically 5 separated bays (A-E)
  const cellSize = 24;
  const gap = 4;
  const span = count * cellSize + (count - 1) * gap; // 5*24 + 4*4 = 136px
  const crossSize = 28;

  const isRestricted =
    shelf.shelfId.startsWith('RES') ||
    shelf.shelfId.startsWith('ARC') ||
    shelf.section.toLowerCase().includes('archive');

  const fillColor = isDestination
    ? '#FF7138'
    : isSelected
    ? '#25C6B7'
    : isRestricted
    ? '#231E3D'
    : '#1F1A45';

  const strokeColor = isDestination
    ? '#F5E8C8'
    : isSelected
    ? '#25C6B7'
    : isRestricted
    ? '#7850C8'
    : '#FF7138';

  const textColor = isDestination || isSelected ? '#100E2D' : '#F5E8C8';

  const badgeBg = isDestination
    ? '#FF7138'
    : isSelected
    ? '#25C6B7'
    : '#100E2D';
  const badgeText = isDestination || isSelected ? '#100E2D' : '#F5E8C8';
  const badgeBorder = isDestination
    ? '#F5E8C8'
    : isSelected
    ? '#100E2D'
    : '#7850C8';

  const totalW = isVertical ? crossSize : span;
  const totalH = isVertical ? span : crossSize;

  return (
    <g
      id={`shelf-${shelf.shelfId}`}
      transform={`translate(${shelf.x}, ${shelf.y})`}
      className="cursor-pointer group select-none"
    >
      {/* Target Destination Pixel Beacon Frame */}
      {isDestination && (
        <g>
          <rect
            x={-totalW / 2 - 6}
            y={-totalH / 2 - 6}
            width={totalW + 12}
            height={totalH + 12}
            fill="none"
            stroke="#FF7138"
            strokeWidth="2.5"
            strokeDasharray="8 5"
            className="animate-pulse"
          />

          {/* Retro Pixel Floating Pin Icon */}
          <g transform={`translate(0, ${-totalH / 2 - 20})`}>
            <rect
              x="-9"
              y="-12"
              width="18"
              height="12"
              fill="#FF7138"
              stroke="#100E2D"
              strokeWidth="2"
            />
            <polygon points="-5,0 5,0 0,6" fill="#FF7138" />
            <rect x="-4" y="-8" width="8" height="4" fill="#F5E8C8" />
          </g>
        </g>
      )}

      {/* Selected Indicator Frame if not destination */}
      {isSelected && !isDestination && (
        <rect
          x={-totalW / 2 - 4}
          y={-totalH / 2 - 4}
          width={totalW + 8}
          height={totalH + 8}
          fill="none"
          stroke="#25C6B7"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}

      {/* Subtle Mounting Track Rail connecting separated partitions visually */}
      {isVertical ? (
        <line
          x1="0"
          y1={-span / 2 + 4}
          x2="0"
          y2={span / 2 - 4}
          stroke={isDestination ? '#FF7138' : '#3A366E'}
          strokeWidth="4"
        />
      ) : (
        <line
          x1={-span / 2 + 4}
          y1="0"
          x2={span / 2 - 4}
          y2="0"
          stroke={isDestination ? '#FF7138' : '#3A366E'}
          strokeWidth="4"
        />
      )}

      {/* 5 PHYSICALLY SEPARATED SHELF PARTITIONS */}
      {partitions.map((part, idx) => {
        const offset = -span / 2 + idx * (cellSize + gap);
        const px = isVertical ? -crossSize / 2 : offset;
        const py = isVertical ? offset : -crossSize / 2;
        const pw = isVertical ? crossSize : cellSize;
        const ph = isVertical ? cellSize : crossSize;
        const isPartSelected = selectedPartitionId === part.partitionId;

        return (
          <g
            key={part.partitionId}
            transform={`translate(${px}, ${py})`}
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(shelf, part);
            }}
            className="hover:brightness-125 transition-all"
          >
            {/* Individual Partition Drop Shadow */}
            <rect x="2.5" y="2.5" width={pw} height={ph} fill="#0A081D" />

            {/* Separated Partition Tile Body */}
            <rect
              width={pw}
              height={ph}
              fill={isPartSelected ? '#25C6B7' : fillColor}
              stroke={isPartSelected ? '#F5E8C8' : strokeColor}
              strokeWidth={isPartSelected ? '2.5' : '2'}
            />

            {/* Top/Left Retro Inset Bevel */}
            <line
              x1="1.5"
              y1="1.5"
              x2={pw - 2}
              y2="1.5"
              stroke={isDestination ? '#FFE2B8' : '#3C356F'}
              strokeWidth="1"
            />
            <line
              x1="1.5"
              y1="1.5"
              x2="1.5"
              y2={ph - 2}
              stroke={isDestination ? '#FFE2B8' : '#3C356F'}
              strokeWidth="1"
            />

            {/* Partition Sub-Code Letter (A, B, C, D, E) */}
            <text
              x={pw / 2}
              y={ph / 2 + 4}
              textAnchor="middle"
              fill={isPartSelected ? '#100E2D' : textColor}
              className="font-mono text-[9px] font-black pointer-events-none select-none"
            >
              {part.code}
            </text>

            <title>
              {`${part.partitionId} · ${part.label || shelf.section} (${shelf.callNumberRange || ''})`}
            </title>
          </g>
        );
      })}

      {/* Specific Shelf ID Badge */}
      <g
        transform={
          isVertical
            ? `translate(0, ${-totalH / 2 - 11})`
            : `translate(${-totalW / 2 + 30}, ${-totalH / 2 - 9})`
        }
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(shelf);
        }}
      >
        <rect
          x="-30"
          y="-8"
          width="60"
          height="14"
          fill={badgeBg}
          stroke={badgeBorder}
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="2"
          textAnchor="middle"
          fill={badgeText}
          className="font-mono text-[8px] font-black tracking-wider pointer-events-none select-none"
        >
          {shelf.shelfId}
        </text>
      </g>

      {/* Destination Retro Tag */}
      {isDestination && (
        <g transform={`translate(0, ${totalH / 2 + 12})`}>
          <rect
            x="-36"
            y="-7"
            width="72"
            height="14"
            fill="#F5E8C8"
            stroke="#100E2D"
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill="#100E2D"
            className="font-mono text-[7px] font-black uppercase tracking-wider"
          >
            ★ GOAL
          </text>
        </g>
      )}
    </g>
  );
};
