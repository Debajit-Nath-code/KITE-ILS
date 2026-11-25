import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { useToast } from '../components/ui/Toast';
import { FloorPlan } from '../components/wayfinding/FloorPlan';
import { NavigationPanel } from '../components/wayfinding/NavigationPanel';
import { FloorSelector } from '../components/wayfinding/FloorSelector';
import { 
  CENTRAL_LIBRARY_SHELVES, 
  CENTRAL_LIBRARY_LANDMARKS, 
  ENTRANCE_POINT,
  generateRouteForShelf,
  getShelfIdForBook
} from '../data/wayfindingData';
import { MockShelfService } from '../services/mockShelfService';
import { mockBooks } from '../data/mockData';
import { LibraryFloor, ShelfCoordinate, ShelfPartition, WayfindingRoute } from '../types';
import { 
  Compass, 
  MapPin, 
  Building2, 
  Footprints, 
  Search, 
  Sparkles, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

export const WayfindingPage: React.FC = () => {
  const { shelfId } = useParams<{ shelfId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const queryShelf = searchParams.get('shelf');
  const queryCallNumber = searchParams.get('callNumber');
  const queryTitle = searchParams.get('title') || searchParams.get('bookTitle');
  const queryBookId = searchParams.get('bookId');

  // Determine initial shelf target:
  let calculatedShelfId = shelfId || queryShelf || '';
  let calculatedBookTitle = queryTitle || '';

  if (!calculatedShelfId && queryBookId) {
    const book = mockBooks.find((b) => b.id === queryBookId);
    if (book) {
      calculatedShelfId = getShelfIdForBook(book);
      if (!calculatedBookTitle) calculatedBookTitle = book.title;
    }
  }

  if (!calculatedShelfId && queryCallNumber) {
    calculatedShelfId = getShelfIdForBook({ location: { callNumber: queryCallNumber } });
  }

  if (!calculatedShelfId) {
    calculatedShelfId = 'CS-204';
  }

  const initialShelfId = calculatedShelfId.toUpperCase();

  const [shelves, setShelves] = useState<ShelfCoordinate[]>(() => MockShelfService.getAllShelves());

  // Subscribe to live shelf movements & additions from Admin Map Manager
  useEffect(() => {
    const unsubscribe = MockShelfService.subscribe((updated) => {
      setShelves(updated);
      setSelectedShelf((prev) => {
        const found = updated.find((s) => s.shelfId === prev.shelfId);
        return found || prev;
      });
    });
    return unsubscribe;
  }, []);

  // Find target shelf or default to CS-204
  const targetShelf =
    shelves.find((s) => s.shelfId.toUpperCase() === initialShelfId) ||
    shelves.find((s) => s.shelfId === 'CS-204') ||
    shelves[0];

  const defaultTitle = calculatedBookTitle || (
    targetShelf.shelfId === 'CS-204' 
      ? 'Data Structures Using C' 
      : (targetShelf.bookTitles?.[0] || 'Academic Monograph')
  );

  const [selectedShelf, setSelectedShelf] = useState<ShelfCoordinate>(targetShelf);
  const [selectedPartitionId, setSelectedPartitionId] = useState<string | undefined>(
    targetShelf.partitions?.[0]?.partitionId
  );
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>(defaultTitle);

  // Active Floor view (1 or 2). Default to Floor 1 so user sees the START position & ground entrance
  const [activeFloor, setActiveFloor] = useState<LibraryFloor>(1);

  // Turn-by-Turn Navigation States
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Route calculation
  const [route, setRoute] = useState<WayfindingRoute>(() =>
    generateRouteForShelf(targetShelf.shelfId, defaultTitle, shelves)
  );

  // Search input for searching different shelves
  const [shelfSearchQuery, setShelfSearchQuery] = useState('');

  // Zoom / Scale factor for map controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Update target when shelfId or search params change
  useEffect(() => {
    let resolvedId = shelfId || queryShelf || '';
    let resolvedTitle = queryTitle || '';

    if (!resolvedId && queryBookId) {
      const book = mockBooks.find((b) => b.id === queryBookId);
      if (book) {
        resolvedId = getShelfIdForBook(book);
        if (!resolvedTitle) resolvedTitle = book.title;
      }
    }

    if (!resolvedId && queryCallNumber) {
      resolvedId = getShelfIdForBook({ location: { callNumber: queryCallNumber } });
    }

    if (!resolvedId) {
      resolvedId = 'CS-204';
    }

    let resolvedTarget = resolvedId.toUpperCase();
    if (resolvedTarget === 'LIT-202') resolvedTarget = 'LIT-201';

    const found = shelves.find((s) => s.shelfId.toUpperCase() === resolvedTarget);
    if (found) {
      setSelectedShelf(found);
      setSelectedPartitionId((prev) =>
        prev && prev.startsWith(found.shelfId) ? prev : found.partitions?.[0]?.partitionId
      );
      const title = resolvedTitle || (
        found.shelfId === 'CS-204' 
          ? 'Data Structures Using C' 
          : (found.bookTitles?.[0] || 'Academic Monograph')
      );
      setSelectedBookTitle(title);
      setRoute(generateRouteForShelf(found.shelfId, title, shelves));
    }
  }, [shelfId, queryShelf, queryCallNumber, queryTitle, queryBookId, shelves]);

  // Current Position tracking
  const currentStep = route.steps[currentStepIndex] || route.steps[0];
  const currentPosition = isNavigating
    ? {
        x: currentStep.point.x,
        y: currentStep.point.y,
        floor: currentStep.floor,
      }
    : {
        x: ENTRANCE_POINT.x,
        y: ENTRANCE_POINT.y,
        floor: 1 as LibraryFloor, // Starts at East Main Entrance
      };

  // Auto-walk simulation effect
  useEffect(() => {
    let timer: any = null;
    if (isNavigating && isAutoWalking) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < route.steps.length - 1) {
            const nextIdx = prev + 1;
            const nextStep = route.steps[nextIdx];
            if (nextStep.floor !== activeFloor) {
              setActiveFloor(nextStep.floor);
            }
            return nextIdx;
          } else {
            setIsAutoWalking(false);
            toast.success(
              'Arrived at Destination! ★',
              `You have reached Shelf ${selectedShelf.shelfId} (${selectedShelf.section}).`
            );
            return prev;
          }
        });
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isNavigating, isAutoWalking, route, activeFloor, selectedShelf]);

  // Handlers
  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
    setActiveFloor(1); // Start at Entrance on Floor 1
    toast.info(
      'Navigation Active',
      `Routing from Main Entrance to Shelf ${selectedShelf.shelfId}. Follow the orange corridor path.`
    );
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setIsAutoWalking(false);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < route.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = route.steps[nextIdx];
      if (nextStep.floor !== activeFloor) {
        setActiveFloor(nextStep.floor);
      }
      if (nextIdx === route.steps.length - 1) {
        toast.success(
          'Arrived at Shelf',
          `Target reached: Shelf ${selectedShelf.shelfId}. Monograph on tier 2.`
        );
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const prevStep = route.steps[prevIdx];
      if (prevStep.floor !== activeFloor) {
        setActiveFloor(prevStep.floor);
      }
    }
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    const targetStep = route.steps[idx];
    if (targetStep && targetStep.floor !== activeFloor) {
      setActiveFloor(targetStep.floor);
    }
  };

  const handleSelectShelf = (shelf: ShelfCoordinate, partition?: ShelfPartition) => {
    setSelectedShelf(shelf);
    const chosenPartId = partition?.partitionId || shelf.partitions?.[0]?.partitionId;
    setSelectedPartitionId(chosenPartId);

    const bookTitle = shelf.shelfId === 'CS-204' 
      ? 'Data Structures Using C' 
      : (shelf.bookTitles?.[0] || `${shelf.section} Reference`);
    setSelectedBookTitle(bookTitle);
    const newRoute = generateRouteForShelf(shelf.shelfId, bookTitle, shelves);
    setRoute(newRoute);
    setCurrentStepIndex(0);
    setIsNavigating(false);
    setIsAutoWalking(false);

    navigate(`/navigate/${shelf.shelfId}`, { replace: true });
    toast.info(
      'Route Recalibrated',
      partition
        ? `Target set to Partition ${partition.partitionId} (${partition.label || shelf.section}, Floor ${shelf.floor}).`
        : `Target set to Shelf ${shelf.shelfId} (${shelf.section}, Floor ${shelf.floor}).`
    );
  };

  const handleSearchShelfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelfSearchQuery.trim()) return;
    const q = shelfSearchQuery.toUpperCase().trim();
    const found = shelves.find(
      (s) =>
        s.shelfId.toUpperCase().includes(q) ||
        s.section.toUpperCase().includes(q) ||
        s.bookTitles?.some((t) => t.toUpperCase().includes(q))
    );
    if (found) {
      handleSelectShelf(found);
      setShelfSearchQuery('');
    } else {
      toast.error('Shelf Not Located', `No shelf record found for "${shelfSearchQuery}".`);
    }
  };

  return (
    <div className="min-h-screen bg-[#100E2D] text-[#F5E8C8] p-3 sm:p-6 font-mono">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* ================================================================= */}
        {/* RETRO 90S CONSOLE HEADER (Netscape / Retro-Web Inspired)           */}
        {/* ================================================================= */}
        <header className="bg-[#17132D] border-4 border-[#17132D] shadow-[6px_6px_0px_#7850C8] p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Console Branding & Status Lights */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#FF7138] border border-[#100E2D] inline-block animate-pulse" />
                <h1 className="font-pixel text-xs sm:text-sm text-[#FF7138] uppercase tracking-wider font-black">
                  KITE ILS // SPATIAL NAVIGATION SYSTEM
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#F5E8C8]/80 font-mono">
                <span className="flex items-center gap-1.5 bg-[#100E2D] px-2 py-0.5 border border-[#25234A]">
                  <span className="text-[#25C6B7]">LIBRARY:</span>
                  <span className="text-white font-bold">CENTRAL LIBRARY CAMPUS</span>
                </span>
                <span className="flex items-center gap-1.5 bg-[#100E2D] px-2 py-0.5 border border-[#25234A]">
                  <span className="text-[#25C6B7]">MAP STATUS:</span>
                  <span className="text-[#43C95E] font-bold">ONLINE (GIS-CALIBRATED)</span>
                </span>
                <span className="flex items-center gap-1.5 bg-[#100E2D] px-2 py-0.5 border border-[#25234A] hidden sm:inline-flex">
                  <span className="text-[#FF7138]">BLUEPRINT:</span>
                  <span className="text-[#F5E8C8]">800x1000 MODE</span>
                </span>
              </div>
            </div>

            {/* Right: Retro Compass & Catalog Link */}
            <div className="flex items-center gap-3 self-end lg:self-center">
              {/* Retro Pixel Compass */}
              <div className="flex items-center gap-2 bg-[#100E2D] px-3 py-1.5 border-2 border-[#7850C8]">
                <div className="w-5 h-5 bg-[#7850C8] border border-[#100E2D] flex items-center justify-center text-[10px] text-[#F5E8C8] font-pixel font-bold">
                  N
                </div>
                <div className="text-[9px] leading-tight">
                  <div className="text-[#25C6B7] font-pixel font-bold">AZIMUTH 0°</div>
                  <div className="text-[#F5E8C8]/60 text-[8px]">NORTH-FACING</div>
                </div>
              </div>

              <Link to="/discover">
                <button
                  type="button"
                  className="px-3 py-2 bg-[#25C6B7] text-[#100E2D] border-2 border-[#100E2D] shadow-[3px_3px_0px_#100E2D] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 font-pixel text-[9px] font-bold uppercase cursor-pointer"
                >
                  ◄ CATALOG SEARCH
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* FLOOR SELECTOR & SHELF LOCATOR TOOLBAR                           */}
        {/* ================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tab-based Retro Floor Selector */}
          <FloorSelector
            activeFloor={activeFloor}
            onSelectFloor={(fl) => setActiveFloor(fl)}
            destinationFloor={selectedShelf.floor}
            currentFloor={currentPosition.floor}
            className="w-full md:w-auto"
          />

          {/* Quick Shelf Code Finder Form */}
          <form onSubmit={handleSearchShelfSubmit} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={shelfSearchQuery}
                onChange={(e) => setShelfSearchQuery(e.target.value)}
                placeholder="SEARCH SHELF ID (CS-204, PHY-101)..."
                className="w-72 h-10 px-3 bg-[#17132D] border-2 border-[#7850C8] text-[#F5E8C8] text-xs font-mono placeholder-[#F5E8C8]/40 focus:outline-none focus:border-[#25C6B7] shadow-[2px_2px_0px_#100E2D]"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-[#FF7138] text-[#100E2D] font-pixel text-[9px] font-bold uppercase border-2 border-[#100E2D] shadow-[2px_2px_0px_#100E2D] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              [ LOCATE ]
            </button>
          </form>
        </div>

        {/* ================================================================= */}
        {/* MAIN WORKSPACE: MAP CANVAS + ROUTE HUD                           */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 4 COLS: RETRO NAVIGATION INFORMATION PANEL */}
          <div className="lg:col-span-4 space-y-4">
            <NavigationPanel
              route={route}
              selectedShelf={selectedShelf}
              selectedPartitionId={selectedPartitionId}
              onSelectPartition={(part) => {
                setSelectedPartitionId(part.partitionId);
                toast.info(`Partition ${part.partitionId}`, part.label || 'Bay selected');
              }}
              activeFloor={activeFloor}
              currentStepIndex={currentStepIndex}
              isNavigating={isNavigating}
              isAutoWalking={isAutoWalking}
              onStartNavigation={handleStartNavigation}
              onStopNavigation={handleStopNavigation}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onSelectStep={handleSelectStep}
              onToggleAutoWalk={() => setIsAutoWalking(!isAutoWalking)}
              onSwitchFloor={(fl) => setActiveFloor(fl)}
            />

            {/* RETRO LEGEND PANEL */}
            <div className="bg-[#17132D] border-3 border-[#25234A] shadow-[4px_4px_0px_#100E2D] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#25234A]">
                <span className="font-pixel text-[8px] text-[#25C6B7] uppercase font-bold">
                  ★ MAP LEGEND & SYMBOLOGY
                </span>
                <span className="font-mono text-[9px] text-[#F5E8C8]/60">KEY</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#25C6B7] border border-[#100E2D] shrink-0" />
                  <span className="text-[11px] text-[#F5E8C8]">Study Desk / You</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#FF7138] border border-[#100E2D] shrink-0" />
                  <span className="text-[11px] text-[#F5E8C8]">Walk Route / Cabin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#FF7138] border-2 border-[#F5E8C8] shrink-0" />
                  <span className="text-[11px] text-[#F5E8C8]">Target Shelf (A–E)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#1F1A45] border border-[#FF7138] shrink-0" />
                  <span className="text-[11px] text-[#F5E8C8]">Shelf Partitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#43C95E] border border-[#100E2D] shrink-0" />
                  <span className="text-[11px] text-[#F5E8C8]">Help Desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#FFD83D] border border-[#100E2D] shrink-0" />
                  <span className="text-[11px] text-[#F5E8C8]">Computer Area</span>
                </div>
              </div>
            </div>

            {/* Quick Shelf Code Grid Index */}
            <div className="bg-[#17132D] border-3 border-[#25234A] shadow-[4px_4px_0px_#100E2D] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#25234A]">
                <span className="font-pixel text-[8px] text-[#F5E8C8] uppercase font-bold">
                  SHELF MATRIX INDEX
                </span>
                <span className="font-mono text-[9px] text-[#25C6B7] font-bold">
                  {shelves.length} BAYS RECORDED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {shelves.map((s) => {
                  const isCurrent = s.shelfId === selectedShelf.shelfId;
                  return (
                    <button
                      key={s.shelfId}
                      type="button"
                      onClick={() => handleSelectShelf(s)}
                      className={`
                        p-2 border text-left text-xs transition-colors flex items-center justify-between cursor-pointer
                        ${
                          isCurrent
                            ? 'bg-[#FF7138] text-[#100E2D] border-[#100E2D] font-bold shadow-[2px_2px_0px_#100E2D]'
                            : 'bg-[#100E2D] border-[#25234A] text-[#F5E8C8] hover:bg-[#7850C8] hover:text-white'
                        }
                      `}
                    >
                      <span className="font-mono font-bold">{s.shelfId}</span>
                      <span className="text-[9px] opacity-75 font-mono">FL-{s.floor}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 8 COLS: RETRO ARCHITECTURAL MAP CANVAS & CONTROLS */}
          <div className="lg:col-span-8 space-y-3">
            {/* Map Canvas Header Toolbar */}
            <div className="flex items-center justify-between text-xs px-2 py-1 bg-[#17132D] border-2 border-[#25234A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#25C6B7]" />
                <span className="font-pixel text-[8px] text-[#F5E8C8]">
                  CENTRAL_LIBRARY // FLOOR_0{activeFloor}
                </span>
              </div>

              {/* Map Zoom & Controls Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.45))}
                  className="px-2 py-1 bg-[#100E2D] hover:bg-[#7850C8] text-[#F5E8C8] border border-[#25234A] font-pixel text-[8px] flex items-center gap-1 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3 text-[#25C6B7]" />
                  <span>ZOOM +</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
                  className="px-2 py-1 bg-[#100E2D] hover:bg-[#7850C8] text-[#F5E8C8] border border-[#25234A] font-pixel text-[8px] flex items-center gap-1 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3 text-[#FF7138]" />
                  <span>ZOOM -</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-1 bg-[#100E2D] hover:bg-[#7850C8] text-[#F5E8C8] border border-[#25234A] font-pixel text-[8px] flex items-center gap-1 cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3 text-[#F5E8C8]" />
                  <span>RESET [1:1]</span>
                </button>
              </div>
            </div>

            {/* Scalable Interactive FloorPlan Container */}
            <div 
              className="transition-transform duration-200 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <FloorPlan
                floor={activeFloor}
                shelves={shelves}
                landmarks={CENTRAL_LIBRARY_LANDMARKS}
                destinationShelfId={selectedShelf.shelfId}
                selectedPartitionId={selectedPartitionId}
                route={route}
                currentPosition={currentPosition}
                isNavigating={isNavigating}
                activeStepIndex={currentStepIndex}
                onSelectShelf={handleSelectShelf}
              />
            </div>

            {/* Retro Console Status Footer */}
            <div className="p-3 bg-[#17132D] border-2 border-[#25234A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#F5E8C8]/80 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#FF7138] font-bold">▶</span>
                <span>
                  <strong className="text-[#25C6B7]">NAVIGATION PROTOCOL:</strong> Follow angular corridor guide lines. Select any shelf bay to recalibrate.
                </span>
              </div>
              <div className="text-[10px] text-[#7850C8] font-pixel shrink-0">
                KITE-WAYFIND v95.4 · ACTIVE
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
