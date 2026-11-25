import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Move, 
  Plus, 
  Edit3, 
  Trash2, 
  Compass, 
  BookOpen, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  RotateCcw, 
  Info, 
  Sparkles, 
  ArrowRight, 
  Search,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { MonospaceCallout } from '../../components/ui/Typography';
import { useToast } from '../../components/ui/Toast';
import { MockShelfService } from '../../services/mockShelfService';
import { LibraryService } from '../../services/mockLibraryService';
import { PhysicalCopiesService } from '../../data/mockCopiesData';
import { ShelfCoordinate, ShelfOrientation, LibraryFloor, Book, DetailedBookCopy } from '../../types';
import { CENTRAL_LIBRARY_LANDMARKS, buildPartitions } from '../../data/wayfindingData';

export const AdminMapPage: React.FC = () => {
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Stacks hierarchy selection state
  // Hierarchy: Library -> Building -> Floor -> Section -> Shelf
  const [selectedLibrary] = useState('Central Library');
  const [selectedBuilding] = useState('Main University Library');
  const [activeFloor, setActiveFloor] = useState<LibraryFloor>(2);
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Shelves state from shared MockShelfService
  const [shelves, setShelves] = useState<ShelfCoordinate[]>(() => MockShelfService.getAllShelves());
  const [selectedShelfId, setSelectedShelfId] = useState<string>('CS-204');

  // Related data for Book -> Copy -> Shelf -> Floor -> Coordinates demonstration
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allCopies, setAllCopies] = useState<DetailedBookCopy[]>([]);

  // Drag-and-drop state
  const [draggingShelfId, setDraggingShelfId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [liveDragCoords, setLiveDragCoords] = useState<{ x: number; y: number } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Form state
  const [formShelfId, setFormShelfId] = useState('');
  const [formSection, setFormSection] = useState('Computer Science');
  const [formFloor, setFormFloor] = useState<LibraryFloor>(2);
  const [formOrientation, setFormOrientation] = useState<ShelfOrientation>('horizontal');
  const [formDepartment, setFormDepartment] = useState('Computer Science');
  const [formCategory, setFormCategory] = useState('Operating Systems');
  const [formX, setFormX] = useState<number>(420);
  const [formY, setFormY] = useState<number>(695);

  // Load shared holdings and copies
  useEffect(() => {
    LibraryService.getBooks({}).then(setAllBooks);
    setAllCopies(PhysicalCopiesService.getAllCopies());

    const unsubscribe = MockShelfService.subscribe((updated) => {
      setShelves(updated);
    });
    return unsubscribe;
  }, []);

  // Filter shelves for current floor and section
  const floorShelves = useMemo(() => {
    return shelves.filter((s) => s.floor === activeFloor && (selectedSection === 'All' || s.section === selectedSection));
  }, [shelves, activeFloor, selectedSection]);

  // Unique sections for the active floor
  const floorSections = useMemo(() => {
    const list = shelves.filter((s) => s.floor === activeFloor).map((s) => s.section);
    return ['All', ...Array.from(new Set(list))];
  }, [shelves, activeFloor]);

  // Selected shelf object
  const selectedShelf = useMemo(() => {
    return shelves.find((s) => s.shelfId === selectedShelfId) || floorShelves[0] || shelves[0];
  }, [shelves, selectedShelfId, floorShelves]);

  // Connected books and copies for the selected shelf
  // Demonstrates: Book -> Copy -> Shelf -> Floor -> Coordinates
  const connectedBooks = useMemo(() => {
    if (!selectedShelf) return [];
    return allBooks.filter(
      (b) =>
        b.location.shelf === selectedShelf.shelfId ||
        b.location.shelf.includes(selectedShelf.shelfId) ||
        (selectedShelf.shelfId === 'CS-204' && b.title.includes('Operating System'))
    );
  }, [allBooks, selectedShelf]);

  const connectedCopies = useMemo(() => {
    if (!selectedShelf) return [];
    return allCopies.filter(
      (c) => c.shelf === selectedShelf.shelfId || c.shelf.includes(selectedShelf.shelfId)
    );
  }, [allCopies, selectedShelf]);

  // Sync selection floor if selected shelf is on different floor
  useEffect(() => {
    if (selectedShelf && selectedShelf.floor !== activeFloor) {
      setActiveFloor(selectedShelf.floor);
    }
  }, [selectedShelfId]);

  // Convert mouse event to SVG coordinate space (viewBox 0 0 1000 650)
  const getSvgCoordinates = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return {
      x: Math.round(transformed.x),
      y: Math.round(transformed.y),
    };
  };

  // Drag Handlers
  const handleMouseDownOnShelf = (e: React.MouseEvent, shelf: ShelfCoordinate) => {
    e.stopPropagation();
    setSelectedShelfId(shelf.shelfId);
    setDraggingShelfId(shelf.shelfId);

    const coords = getSvgCoordinates(e);
    setDragOffset({
      x: coords.x - shelf.x,
      y: coords.y - shelf.y,
    });
    setLiveDragCoords({ x: shelf.x, y: shelf.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingShelfId) return;
    const coords = getSvgCoordinates(e);
    const newX = Math.round(Math.max(85, Math.min(715, coords.x - dragOffset.x)));
    const newY = Math.round(Math.max(70, Math.min(920, coords.y - dragOffset.y)));

    setLiveDragCoords({ x: newX, y: newY });
    // Update live state for smooth visual dragging
    setShelves((prev) =>
      prev.map((s) => (s.shelfId === draggingShelfId ? { ...s, x: newX, y: newY } : s))
    );
  };

  const handleMouseUp = () => {
    if (draggingShelfId && liveDragCoords) {
      MockShelfService.updateCoordinates(draggingShelfId, liveDragCoords.x, liveDragCoords.y);
      toast.success(
        'Shelf Relocated ✅',
        `Shelf ${draggingShelfId} coordinates saved at (X: ${liveDragCoords.x}, Y: ${liveDragCoords.y}).`
      );
    }
    setDraggingShelfId(null);
    setLiveDragCoords(null);
  };

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!selectedShelf) return;
    setFormShelfId(selectedShelf.shelfId);
    setFormSection(selectedShelf.section);
    setFormFloor(selectedShelf.floor);
    setFormOrientation(selectedShelf.orientation || 'horizontal');
    setFormDepartment(selectedShelf.department || 'Computer Science');
    setFormCategory(selectedShelf.category || 'General Studies');
    setFormX(selectedShelf.x);
    setFormY(selectedShelf.y);
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextIdx = shelves.length + 1;
    const prefix = activeFloor === 2 ? 'CS' : 'PHY';
    setFormShelfId(`${prefix}-${activeFloor}0${nextIdx}`);
    setFormSection(activeFloor === 2 ? 'Computer Science' : 'Physical Sciences');
    setFormFloor(activeFloor);
    setFormOrientation('horizontal');
    setFormDepartment(activeFloor === 2 ? 'Computer Science' : 'Physics');
    setFormCategory('Academic Monograph Stack');
    setFormX(420);
    setFormY(450);
    setIsAddModalOpen(true);
  };

  // Save Add Shelf
  const handleSaveAddShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formShelfId.trim()) return;

    const cleanId = formShelfId.toUpperCase().trim();
    const created = MockShelfService.addShelf({
      shelfId: cleanId,
      section: formSection,
      floor: formFloor,
      orientation: formOrientation,
      partitions: buildPartitions(cleanId),
      department: formDepartment,
      category: formCategory,
      x: Number(formX),
      y: Number(formY),
      library: selectedLibrary,
      building: selectedBuilding,
      aisle: `Aisle 0${Math.floor(1 + Math.random() * 9)}`,
    });

    toast.success('Shelf Registered ✅', `Shelf ${created.shelfId} calibrated on Floor ${created.floor}.`);
    setSelectedShelfId(created.shelfId);
    setActiveFloor(created.floor);
    setIsAddModalOpen(false);
  };

  // Save Edit Shelf
  const handleSaveEditShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelf) return;

    const updated = MockShelfService.updateShelf(selectedShelf.shelfId, {
      shelfId: formShelfId.toUpperCase().trim(),
      section: formSection,
      floor: formFloor,
      orientation: formOrientation,
      department: formDepartment,
      category: formCategory,
      x: Number(formX),
      y: Number(formY),
    });

    if (updated) {
      toast.success('Shelf Record Updated ✅', `Changes to Shelf ${updated.shelfId} saved.`);
      setSelectedShelfId(updated.shelfId);
      setIsEditModalOpen(false);
    }
  };

  // Save Move Shelf (Precise Coordinates Adjustment)
  const handleSaveMoveShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelf) return;

    const updated = MockShelfService.updateCoordinates(selectedShelf.shelfId, Number(formX), Number(formY));
    if (updated) {
      toast.success('Coordinates Updated', `Moved Shelf ${updated.shelfId} to (X: ${updated.x}, Y: ${updated.y}).`);
      setIsMoveModalOpen(false);
    }
  };

  // Delete Shelf
  const handleDeleteShelf = () => {
    if (!selectedShelf) return;
    MockShelfService.deleteShelf(selectedShelf.shelfId);
    toast.info('Shelf Deleted', `Shelf ${selectedShelf.shelfId} removed from floor plan.`);
    setIsDeleteModalOpen(false);
    const remaining = MockShelfService.getShelvesByFloor(activeFloor);
    if (remaining.length > 0) {
      setSelectedShelfId(remaining[0].shelfId);
    }
  };

  // Reset to initial library defaults
  const handleResetDefaults = () => {
    const defs = MockShelfService.resetToDefaults();
    toast.info('Map Reset', 'Central Library stacks coordinates restored to default calibration.');
    setSelectedShelfId('CS-204');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ===================================================================== */}
      {/* TOP HEADER & HIERARCHY BREADCRUMBS                                    */}
      {/* Library -> Building -> Floor -> Section -> Shelf                      */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-1">
            <span className="font-semibold text-sky-800">{selectedLibrary}</span>
            <span>→</span>
            <span className="text-slate-700">{selectedBuilding}</span>
            <span>→</span>
            <span className="font-bold text-slate-900">Floor {activeFloor}</span>
            <span>→</span>
            <span className="text-sky-700">{selectedShelf ? selectedShelf.section : 'Stacks'}</span>
            <span>→</span>
            <span className="font-bold text-sky-950 bg-sky-100 px-1.5 py-0.5 rounded text-[11px]">
              {selectedShelf ? selectedShelf.shelfId : 'CS-204'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Library Floor Plan & Spatial Stacks Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Calibrate physical shelf coordinates, corridors, and stacks geometry used directly by student spatial wayfinding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-slate-600"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDefaults}
          >
            Reset Defaults
          </Button>

          <Link to={`/navigate/${selectedShelf ? selectedShelf.shelfId : 'CS-204'}`}>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              leftIcon={<Compass className="w-4 h-4 text-sky-700" />}
              rightIcon={<ArrowRight className="w-3 h-3 text-slate-400" />}
            >
              Test Student Navigation
            </Button>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* THREE-PANEL ADMIN UI WORKSPACE                                        */}
      {/* Left (Floor/Section) | Center (Interactive SVG) | Right (Shelf Detail)*/}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =================================================================== */}
        {/* LEFT PANEL: FLOOR SELECTOR & SECTIONS (3 Columns)                   */}
        {/* =================================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Floor Selector Card */}
          <Card className="p-4 bg-white border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-700" />
                <span>Floor Level</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">2 Floors Active</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setActiveFloor(1);
                  setSelectedSection('All');
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  activeFloor === 1
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Floor 1 (Ground)</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeFloor === 1 ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {shelves.filter((s) => s.floor === 1).length} Shelves
                  </span>
                </div>
                <span className={`text-[11px] block mt-1 ${activeFloor === 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                  Physics, Math, Bio, Civil, Help Desk & Cabins
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFloor(2);
                  setSelectedSection('All');
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  activeFloor === 2
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Floor 2 (Upper Stacks)</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeFloor === 2 ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {shelves.filter((s) => s.floor === 2).length} Shelves
                  </span>
                </div>
                <span className={`text-[11px] block mt-1 ${activeFloor === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
                  Computer Science, Engineering & Humanities
                </span>
              </button>
            </div>
          </Card>

          {/* Section Filter */}
          <Card className="p-4 bg-white border-slate-200/90 shadow-2xs space-y-3">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              Filter by Section
            </span>
            <div className="flex flex-wrap gap-1.5">
              {floorSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedSection === sec
                      ? 'bg-sky-700 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </Card>

          {/* Shelves on Active Floor Roster */}
          <Card className="p-4 bg-white border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Floor {activeFloor} Shelves ({floorShelves.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-sky-700 text-xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleOpenAddModal}
              >
                Add Shelf
              </Button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {floorShelves.map((s) => {
                const isSelected = selectedShelf && selectedShelf.shelfId === s.shelfId;
                return (
                  <button
                    key={s.shelfId}
                    type="button"
                    onClick={() => setSelectedShelfId(s.shelfId)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono block truncate">{s.shelfId}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{s.section}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {s.x}, {s.y}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* =================================================================== */}
        {/* MAIN PANEL: INTERACTIVE DRAGGABLE SVG FLOOR PLAN (6 Columns)        */}
        {/* =================================================================== */}
        <div className="lg:col-span-6 space-y-3">
          {/* Floor Plan Header Indicator */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-900">
                Central Library · Floor {activeFloor} Map Editor
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-sky-600" />
                <span>Drag Shelves to Reposition</span>
              </span>
            </div>
          </div>

          {/* Interactive SVG Canvas (800x1000 Portrait Actual Library Blueprint) */}
          <div
            className="relative w-full max-w-[600px] mx-auto aspect-[4/5] bg-[#100E2D] overflow-hidden border-4 border-[#17132D] shadow-[8px_8px_0px_#17132D] select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              ref={svgRef}
              className="w-full h-full cursor-crosshair"
              viewBox="0 0 800 1000"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="admin-arch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#25234A" strokeWidth="1" />
                </pattern>
                <pattern id="admin-arch-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#3A366E" strokeWidth="1.5" opacity="0.6" />
                </pattern>
                <pattern id="admin-stairs-pat" width="10" height="10" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="5" x2="10" y2="5" stroke="#F5E8C8" strokeWidth="1.5" opacity="0.6" />
                </pattern>
              </defs>

              {/* Background Blueprint Grid */}
              <rect width="800" height="1000" fill="#100E2D" />
              <rect width="800" height="1000" fill="url(#admin-arch-grid)" />
              <rect width="800" height="1000" fill="url(#admin-arch-grid-major)" />

              {/* Actual Architectural Blueprint Base */}
              {activeFloor === 1 ? (
                <g id="admin-f1-blueprint">
                  <rect x="60" y="50" width="680" height="890" fill="#17132D" />
                  <path
                    d="M 60 50 L 740 50 L 740 135 M 740 215 L 740 940 L 60 940 Z"
                    fill="none"
                    stroke="#7850C8"
                    strokeWidth="4"
                  />
                  {/* Computer Area */}
                  <path
                    d="M 62 52 L 275 52 L 275 165 L 230 165 L 230 98 L 105 98 L 105 215 L 62 215 Z"
                    fill="#FFD83D"
                    stroke="#100E2D"
                    strokeWidth="2.5"
                  />
                  <text x="168" y="82" textAnchor="middle" fill="#100E2D" className="font-mono text-[10px] font-bold">
                    COMPUTER AREA
                  </text>
                  {/* North Cabin */}
                  <rect x="310" y="52" width="155" height="70" fill="#FF7138" stroke="#100E2D" strokeWidth="2.5" />
                  <text x="387.5" y="92" textAnchor="middle" fill="#100E2D" className="font-mono text-[11px] font-bold">
                    CABIN
                  </text>
                  {/* Check In */}
                  <path d="M 505 78 L 602 78 L 602 52 L 650 52 L 650 125 L 505 125 Z" fill="#454879" stroke="#F5E8C8" strokeWidth="2" />
                  <text x="577" y="108" textAnchor="middle" fill="#F5E8C8" className="font-mono text-[10px] font-bold">
                    CHECK IN
                  </text>
                  {/* Entrance */}
                  <rect x="692" y="145" width="82" height="20" fill="#25C6B7" stroke="#100E2D" strokeWidth="2" />
                  <text x="733" y="159" textAnchor="middle" fill="#100E2D" className="font-mono text-[9px] font-bold">
                    ENTRANCE
                  </text>
                  {/* Help Desk */}
                  <rect x="605" y="225" width="133" height="360" fill="#43C95E" stroke="#100E2D" strokeWidth="2.5" />
                  <text x="672" y="405" textAnchor="middle" fill="#100E2D" transform="rotate(-90 672 405)" className="font-mono text-[14px] font-bold tracking-widest">
                    HELP DESK
                  </text>
                  {/* Curved Stairs */}
                  <path d="M 325 245 Q 230 265 230 390 L 278 390 Q 278 302 332 292 Z" fill="#231E48" stroke="#F5E8C8" strokeWidth="2" />
                  <rect x="230" y="390" width="48" height="115" fill="#100E2D" stroke="#F5E8C8" strokeWidth="2" />
                  <text x="254" y="448" textAnchor="middle" fill="#FF7138" transform="rotate(-90 254 448)" className="font-mono text-[10px] font-bold">
                    STAIRS
                  </text>
                  <path d="M 230 505 Q 230 685 405 695 L 405 645 Q 278 638 278 505 Z" fill="#231E48" stroke="#F5E8C8" strokeWidth="2" />
                  {/* South Cabin */}
                  <rect x="355" y="855" width="160" height="82" fill="#FF7138" stroke="#100E2D" strokeWidth="2.5" />
                  <text x="435" y="902" textAnchor="middle" fill="#100E2D" className="font-mono text-[11px] font-bold">
                    CABIN
                  </text>
                </g>
              ) : (
                <g id="admin-f2-blueprint">
                  <rect x="135" y="50" width="570" height="890" fill="#17132D" />
                  <rect x="48" y="50" width="87" height="890" fill="#141133" />
                  <line x1="48" y1="50" x2="48" y2="940" stroke="#7850C8" strokeWidth="3.5" />
                  <path
                    d="M 135 198 L 135 50 L 705 50 L 705 940 L 135 940 L 135 788 M 135 280 L 135 708"
                    fill="none"
                    stroke="#7850C8"
                    strokeWidth="4"
                  />
                  {/* Upper Stair Entry */}
                  <rect x="62" y="200" width="68" height="78" fill="url(#admin-stairs-pat)" stroke="#F5E8C8" strokeWidth="1.5" />
                  <text x="88" y="130" textAnchor="middle" fill="#F5E8C8" transform="rotate(-90 88 130)" className="font-mono text-[10px] font-bold">
                    STAIRS ↓
                  </text>
                  {/* Lower Stair Entry */}
                  <rect x="62" y="710" width="68" height="78" fill="url(#admin-stairs-pat)" stroke="#F5E8C8" strokeWidth="1.5" />
                  <text x="88" y="860" textAnchor="middle" fill="#F5E8C8" transform="rotate(-90 88 860)" className="font-mono text-[10px] font-bold">
                    STAIRS ↑
                  </text>
                </g>
              )}

              {/* Study Desks on Active Floor */}
              {CENTRAL_LIBRARY_LANDMARKS.filter((l) => l.floor === activeFloor && l.type === 'study_desk').map((desk) => (
                <g key={desk.id} transform={`translate(${desk.x}, ${desk.y})`} opacity="0.88">
                  <rect x={-(desk.width || 124) / 2} y={-(desk.height || 28) / 2} width={desk.width || 124} height={desk.height || 28} fill="#25C6B7" stroke="#100E2D" strokeWidth="2" />
                  <text x="0" y="4" textAnchor="middle" fill="#100E2D" className="font-mono text-[9px] font-bold pointer-events-none">
                    DESK
                  </text>
                </g>
              ))}

              {/* Active Drag Alignment Guides */}
              {draggingShelfId && liveDragCoords && (
                <g id="drag-guides" className="pointer-events-none">
                  <line x1={liveDragCoords.x} y1="50" x2={liveDragCoords.x} y2="940" stroke="#25C6B7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
                  <line x1="60" y1={liveDragCoords.y} x2="740" y2={liveDragCoords.y} stroke="#25C6B7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
                  <rect x={Math.min(liveDragCoords.x + 25, 620)} y={Math.max(liveDragCoords.y - 32, 55)} width="115" height="22" fill="#100E2D" stroke="#25C6B7" strokeWidth="1.5" />
                  <text x={Math.min(liveDragCoords.x + 82, 677)} y={Math.max(liveDragCoords.y - 17, 70)} textAnchor="middle" fill="#25C6B7" className="font-mono text-[10px] font-bold">
                    X: {liveDragCoords.x} · Y: {liveDragCoords.y}
                  </text>
                </g>
              )}

              {/* Interactive Draggable Shelves (with 5 Separated Partitions A-E) */}
              {floorShelves.map((shelf) => {
                const isSelected = selectedShelf && selectedShelf.shelfId === shelf.shelfId;
                const isDragging = draggingShelfId === shelf.shelfId;
                const isVertical = shelf.orientation === 'vertical';
                const parts = shelf.partitions && shelf.partitions.length > 0 ? shelf.partitions : buildPartitions(shelf.shelfId);
                const cellSize = 24;
                const gap = 4;
                const span = parts.length * cellSize + (parts.length - 1) * gap;
                const cross = 28;
                const totalW = isVertical ? cross : span;
                const totalH = isVertical ? span : cross;

                return (
                  <g
                    key={shelf.shelfId}
                    transform={`translate(${shelf.x}, ${shelf.y})`}
                    onMouseDown={(e) => handleMouseDownOnShelf(e, shelf)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {/* Glowing Selection Ring */}
                    {isSelected && (
                      <rect
                        x={-totalW / 2 - 5}
                        y={-totalH / 2 - 5}
                        width={totalW + 10}
                        height={totalH + 10}
                        fill="none"
                        stroke="#25C6B7"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Backing Rail */}
                    {isVertical ? (
                      <line x1="0" y1={-span / 2 + 4} x2="0" y2={span / 2 - 4} stroke="#3A366E" strokeWidth="4" />
                    ) : (
                      <line x1={-span / 2 + 4} y1="0" x2={span / 2 - 4} y2="0" stroke="#3A366E" strokeWidth="4" />
                    )}

                    {/* 5 Separated Partition Cells */}
                    {parts.map((part, idx) => {
                      const offset = -span / 2 + idx * (cellSize + gap);
                      const px = isVertical ? -cross / 2 : offset;
                      const py = isVertical ? offset : -cross / 2;
                      const pw = isVertical ? cross : cellSize;
                      const ph = isVertical ? cellSize : cross;
                      return (
                        <g key={part.partitionId} transform={`translate(${px}, ${py})`}>
                          <rect x="2" y="2" width={pw} height={ph} fill="#0A081D" />
                          <rect
                            width={pw}
                            height={ph}
                            fill={isDragging ? '#FF7138' : isSelected ? '#25C6B7' : '#1F1A45'}
                            stroke={isSelected ? '#F5E8C8' : '#FF7138'}
                            strokeWidth="2"
                          />
                          <text
                            x={pw / 2}
                            y={ph / 2 + 4}
                            textAnchor="middle"
                            fill={isSelected || isDragging ? '#100E2D' : '#F5E8C8'}
                            className="font-mono text-[9px] font-black pointer-events-none"
                          >
                            {part.code}
                          </text>
                        </g>
                      );
                    })}

                    {/* Specific Shelf ID Badge */}
                    <g transform={isVertical ? `translate(0, ${-totalH / 2 - 12})` : `translate(${-totalW / 2 + 30}, ${-totalH / 2 - 10})`}>
                      <rect
                        x="-30"
                        y="-8"
                        width="60"
                        height="14"
                        fill={isSelected ? '#25C6B7' : '#100E2D'}
                        stroke={isSelected ? '#100E2D' : '#7850C8'}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill={isSelected ? '#100E2D' : '#F5E8C8'}
                        className="font-mono text-[8px] font-black pointer-events-none"
                      >
                        {shelf.shelfId}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Watermark */}
              <text x="720" y="975" textAnchor="end" className="fill-[#7850C8]/50 font-mono text-sm font-bold tracking-widest pointer-events-none">
                FLOOR 0{activeFloor} · 800×1000 GIS
              </text>
            </svg>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Click or drag any multi-partition shelf directly on the blueprint to update coordinates.</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              ViewBox 800×1000 · 5 Bays/Shelf
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANEL: SELECTED SHELF DETAILS & ACTIONS (3 Columns)           */}
        {/* When a shelf is selected, show:                                     */}
        {/* Shelf ID, Section, Floor, X coordinate, Y coordinate, Category,     */}
        {/* Department + Actions [Add, Edit, Delete, Move]                      */}
        {/* =================================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {selectedShelf ? (
            <Card className="p-5 bg-white border-slate-200 shadow-2xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Selected Shelf Target
                  </span>
                  <h3 className="font-mono text-xl font-bold text-slate-900 mt-0.5">
                    {selectedShelf.shelfId}
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  Floor {selectedShelf.floor}
                </span>
              </div>

              {/* Specifications Required by Prompt */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Section</span>
                  <span className="font-semibold text-slate-900">{selectedShelf.section}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Floor Level</span>
                  <span className="font-semibold text-slate-900">Floor {selectedShelf.floor}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">X Coordinate</span>
                  <span className="font-mono font-bold text-sky-800">{selectedShelf.x} px</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Y Coordinate</span>
                  <span className="font-mono font-bold text-sky-800">{selectedShelf.y} px</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-900">{selectedShelf.department || 'Computer Science'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Discipline Category</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[140px]" title={selectedShelf.category}>
                    {selectedShelf.category || 'General Studies'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Aisle Identifier</span>
                  <span className="font-mono text-slate-700">{selectedShelf.aisle || 'Aisle 04'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Orientation</span>
                  <span className="font-mono uppercase text-slate-800 font-semibold">
                    {selectedShelf.orientation || 'horizontal'}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-slate-500 block mb-1.5">Separated Partitions (A–E)</span>
                  <div className="grid grid-cols-5 gap-1">
                    {(selectedShelf.partitions && selectedShelf.partitions.length > 0
                      ? selectedShelf.partitions
                      : buildPartitions(selectedShelf.shelfId)
                    ).map((p) => (
                      <div
                        key={p.partitionId}
                        title={`${p.partitionId}: ${p.label || 'Bay'}`}
                        className="py-1 text-center font-mono text-[10px] font-bold bg-slate-900 text-sky-300 rounded border border-slate-700"
                      >
                        {p.code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Required by Prompt: [Add Shelf] [Edit Shelf] [Delete Shelf] [Move Shelf] */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    leftIcon={<Move className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setFormX(selectedShelf.x);
                      setFormY(selectedShelf.y);
                      setIsMoveModalOpen(true);
                    }}
                  >
                    Move Shelf
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={handleOpenEditModal}
                  >
                    Edit Shelf
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleOpenAddModal}
                  >
                    Add Shelf
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete Shelf
                  </Button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* CONNECTED DATA PIPELINE INSPECTOR                             */}
              {/* Demonstrates: Book -> Copy -> Shelf -> Floor -> Coordinates   */}
              {/* ============================================================= */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                    <span>Holdings on this Shelf</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {connectedBooks.length} Titles · {connectedCopies.length} Copies
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {connectedBooks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic p-2 bg-slate-50 rounded">
                      No titles explicitly registered to this shelf code yet.
                    </p>
                  ) : (
                    connectedBooks.map((b) => (
                      <div key={b.id} className="p-2 bg-slate-50 rounded text-xs">
                        <Link to={`/book/${b.id}`} className="font-serif font-bold text-slate-900 hover:text-sky-700 block truncate">
                          {b.title}
                        </Link>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5 font-mono">
                          <span>{b.availableCopies} of {b.totalCopies} on shelf</span>
                          <span>Call: {b.location.callNumber.split(' ')[0]}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-sky-50/70 rounded-lg border border-sky-200/70 text-[11px] text-sky-950 space-y-1 font-mono">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    <span>Connected Hierarchy:</span>
                  </div>
                  <div>Book ({connectedBooks[0]?.title || 'Monograph'})</div>
                  <div>→ Physical Copy ({connectedCopies[0]?.copyId || 'CP-CS-04-01'})</div>
                  <div>→ Shelf ({selectedShelf.shelfId})</div>
                  <div>→ Floor {selectedShelf.floor}</div>
                  <div>→ Coordinates ({selectedShelf.x}, {selectedShelf.y})</div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-slate-500 text-xs">
              Select a shelf on the map or left list to inspect coordinates.
            </Card>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: ADD SHELF                                                    */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Physical Shelf Stack"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAddShelf} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Shelf ID * (e.g. CS-204)
              </label>
              <input
                type="text"
                required
                value={formShelfId}
                onChange={(e) => setFormShelfId(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Floor Level
              </label>
              <select
                value={formFloor}
                onChange={(e) => setFormFloor(Number(e.target.value) as LibraryFloor)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value={1}>Floor 1 (Ground Level)</option>
                <option value={2}>Floor 2 (Advanced Stacks)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Section Name
              </label>
              <input
                type="text"
                required
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Department
              </label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Biological Sciences">Biological Sciences</option>
                <option value="Humanities">Humanities</option>
              </select>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Subject Category
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Shelf Orientation
                </label>
                <select
                  value={formOrientation}
                  onChange={(e) => setFormOrientation(e.target.value as ShelfOrientation)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="horizontal">Horizontal (5 Bays Wide)</option>
                  <option value="vertical">Vertical (5 Bays Tall)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Initial X Coordinate (85–715)
              </label>
              <input
                type="number"
                min="85"
                max="715"
                value={formX}
                onChange={(e) => setFormX(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Initial Y Coordinate (70–920)
              </label>
              <input
                type="number"
                min="70"
                max="920"
                value={formY}
                onChange={(e) => setFormY(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
              Calibrate & Save Shelf
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT SHELF                                                   */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Shelf Metadata: ${formShelfId}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditShelf} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Shelf ID *
              </label>
              <input
                type="text"
                required
                value={formShelfId}
                onChange={(e) => setFormShelfId(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Floor
              </label>
              <select
                value={formFloor}
                onChange={(e) => setFormFloor(Number(e.target.value) as LibraryFloor)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value={1}>Floor 1</option>
                <option value={2}>Floor 2</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Section
              </label>
              <input
                type="text"
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Orientation
              </label>
              <select
                value={formOrientation}
                onChange={(e) => setFormOrientation(e.target.value as ShelfOrientation)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Shelf Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: MOVE SHELF (Precise Coordinates Sliders)                     */}
      {/* ===================================================================== */}
      {selectedShelf && (
        <Modal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          title={`Adjust Coordinates for Shelf ${selectedShelf.shelfId}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveMoveShelf} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Drag or enter precise SVG pixel coordinates for Shelf <strong>{selectedShelf.shelfId}</strong> on Floor {selectedShelf.floor}.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1 font-mono">
                  <span className="font-semibold text-slate-800">X Coordinate</span>
                  <span className="font-bold text-sky-800">{formX} px</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="715"
                  value={formX}
                  onChange={(e) => setFormX(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 font-mono">
                  <span className="font-semibold text-slate-800">Y Coordinate</span>
                  <span className="font-bold text-sky-800">{formY} px</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="920"
                  value={formY}
                  onChange={(e) => setFormY(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsMoveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Apply New Position
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: DELETE SHELF                                                 */}
      {/* ===================================================================== */}
      {selectedShelf && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Remove Shelf ${selectedShelf.shelfId}`}
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove <strong>Shelf {selectedShelf.shelfId}</strong> ({selectedShelf.section}) from the Central Library GIS floor plan?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
              Any books or copies located at this shelf will need to be re-assigned.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDeleteShelf}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
