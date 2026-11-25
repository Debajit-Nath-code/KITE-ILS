/**
 * Kite ILS - Spatial Wayfinding Floor Plan & Route Dataset
 * Central Library (Actual Blueprint Layout: Floor 1 & Floor 2, 800x1000 Portrait ViewBox)
 * Every shelf has a specific ID and 5 separated partitions (A-E).
 */
import { ShelfCoordinate, ShelfPartition, MapLandmark, WayfindingRoute, LibraryFloor } from '../types';

export const SHELF_STORAGE_KEY = 'kite_ils_spatial_shelves_v3';

export function buildPartitions(
  shelfId: string,
  partitionLabels: [string, string, string, string, string] = [
    'Bay A (01–20)',
    'Bay B (21–40)',
    'Bay C (41–60)',
    'Bay D (61–80)',
    'Bay E (81–99)',
  ]
): ShelfPartition[] {
  const codes = ['A', 'B', 'C', 'D', 'E'] as const;
  return codes.map((code, idx) => ({
    partitionId: `${shelfId}-${code}`,
    code,
    label: partitionLabels[idx],
  }));
}

export const CENTRAL_LIBRARY_SHELVES: ShelfCoordinate[] = [
  // =========================================================================
  // FLOOR 2 - 7 SHELVES (5 Horizontal + 2 Vertical Corner Shelves)
  // Matches LIBRARY 2nd floor blueprint
  // =========================================================================
  {
    shelfId: 'CS-201',
    section: 'Computer Science',
    floor: 2,
    x: 225,
    y: 85,
    orientation: 'horizontal',
    partitions: buildPartitions('CS-201', [
      'Programming Theory',
      'Compilers & AST',
      'Functional Paradigms',
      'Type Systems',
      'Systems Architecture',
    ]),
    label: 'CS-201',
    aisle: 'North-West Wall Stack (QA76.1 – QA76.5)',
    callNumberRange: 'QA76.1 .C65 – QA76.5 .M39',
    department: 'Computer Science',
    bookTitles: [
      'Structure and Interpretation of Computer Programs',
      'Types and Programming Languages',
      'Computer Systems: A Programmer’s Perspective',
    ],
  },
  {
    shelfId: 'ENG-201',
    section: 'Electrical & Embedded Systems',
    floor: 2,
    x: 615,
    y: 85,
    orientation: 'horizontal',
    partitions: buildPartitions('ENG-201', [
      'Analog Circuits',
      'Microelectronics',
      'Digital Logic',
      'CMOS & VLSI',
      'ARM Architecture',
    ]),
    label: 'ENG-201',
    aisle: 'North-East Wall Stack (TK7815 – TK7874)',
    callNumberRange: 'TK7815 .H67 – TK7874 .P48',
    department: 'Electronics',
    bookTitles: [
      'The Art of Electronics (3rd Ed.)',
      'Microelectronic Circuits',
      'Digital Design and Computer Architecture',
    ],
  },
  {
    shelfId: 'CS-202',
    section: 'Computer Science',
    floor: 2,
    x: 420,
    y: 310,
    orientation: 'horizontal',
    partitions: buildPartitions('CS-202', [
      'Graph Algorithms',
      'Dynamic Programming',
      'Complexity Theory',
      'Data Structures',
      'Randomized Algos',
    ]),
    label: 'CS-202',
    aisle: 'Central Stack Row 01 (QA76.6 – QA76.8)',
    callNumberRange: 'QA76.6 .C662 – QA76.8 .K54',
    department: 'Computer Science',
    bookTitles: [
      'Introduction to Algorithms (4th Ed.)',
      'Algorithms in C++ (Parts 1-4)',
      'Data Structures and Algorithm Analysis',
    ],
  },
  {
    shelfId: 'CS-203',
    section: 'Computer Science',
    floor: 2,
    x: 420,
    y: 505,
    orientation: 'horizontal',
    partitions: buildPartitions('CS-203', [
      'Distributed Consensus',
      'Stream Processing',
      'Relational Engines',
      'Query Optimization',
      'Cloud Storage',
    ]),
    label: 'CS-203',
    aisle: 'Central Stack Row 02 (QA76.9 – QA77.0)',
    callNumberRange: 'QA76.9.D3 – QA76.9.A25',
    department: 'Computer Science',
    bookTitles: [
      'Designing Data-Intensive Applications',
      'Database System Concepts',
      'Distributed Systems: Principles and Paradigms',
    ],
  },
  {
    shelfId: 'CS-204',
    section: 'Computer Science',
    floor: 2,
    x: 420,
    y: 695,
    orientation: 'horizontal',
    partitions: buildPartitions('CS-204', [
      'Process Scheduling',
      'Memory & Virtualization',
      'Kernel Internals',
      'Concurrency & Locks',
      'Network Protocols',
    ]),
    label: 'CS-204',
    aisle: 'Central Stack Row 03 (QA76.76.O63)',
    callNumberRange: 'QA76.76.O63 S558 – QA76.76.O63 W34',
    department: 'Computer Science',
    bookTitles: [
      'Operating System Concepts (10th Ed.)',
      'Data Structures Using C',
      'Modern Operating Systems',
      'TCP/IP Illustrated (Volume 1)',
    ],
  },
  {
    shelfId: 'ENG-202',
    section: 'Mechanical & Structural Systems',
    floor: 2,
    x: 172,
    y: 845,
    orientation: 'vertical',
    partitions: buildPartitions('ENG-202', [
      'Thermodynamics',
      'Machine Design',
      'Fluid Mechanics',
      'Heat Transfer',
      'Material Fatigue',
    ]),
    label: 'ENG-202',
    aisle: 'South-West Wall Stack (TJ145 – TJ265)',
    callNumberRange: 'TJ145 .S55 – TJ265 .B67',
    department: 'Mechanical Engineering',
    bookTitles: [
      'Shigley’s Mechanical Engineering Design',
      'Fundamentals of Thermodynamics',
      'Fluid Mechanics',
    ],
  },
  {
    shelfId: 'LIT-201',
    section: 'Humanities, Literature & Ethics',
    floor: 2,
    x: 668,
    y: 845,
    orientation: 'vertical',
    partitions: buildPartitions('LIT-201', [
      'English Canon',
      'Critical Theory',
      'Classical Drama',
      'Academic Rhetoric',
      'Tech & Ethics',
    ]),
    label: 'LIT-201',
    aisle: 'South-East Wall Stack (PR1109 – BJ1031)',
    callNumberRange: 'PR1109 .N67 – BJ1031 .N56',
    department: 'English',
    bookTitles: [
      'The Norton Anthology of English Literature',
      'Literary Theory: An Introduction',
      'The Oxford Shakespeare: Complete Works',
    ],
  },

  // =========================================================================
  // FLOOR 1 - 10 SHELVES (West Wing 4+1 Vertical, Center Wing 5 Horizontal)
  // Matches LIBRARY 1st floor blueprint
  // =========================================================================
  {
    shelfId: 'PHY-101',
    section: 'Classical Physics & Mechanics',
    floor: 1,
    x: 135,
    y: 365,
    orientation: 'horizontal',
    partitions: buildPartitions('PHY-101', [
      'Feynman Lectures',
      'Newtonian Dynamics',
      'Lagrangian Mechanics',
      'Electromagnetism',
      'Optics & Waves',
    ]),
    label: 'PHY-101',
    aisle: 'West Wing Row 01 (QC21 – QC168)',
    callNumberRange: 'QC21.3 .F49 – QC168 .L34',
    department: 'Physics',
    bookTitles: [
      'The Feynman Lectures on Physics (Vol 1–3)',
      'Classical Mechanics (Goldstein)',
      'Mechanics (Landau and Lifshitz)',
    ],
  },
  {
    shelfId: 'PHY-102',
    section: 'Quantum & Theoretical Physics',
    floor: 1,
    x: 135,
    y: 510,
    orientation: 'horizontal',
    partitions: buildPartitions('PHY-102', [
      'Quantum States',
      'Quantum Gates',
      'Qubit Error Codes',
      'Wave Mechanics',
      'Field Theory',
    ]),
    label: 'PHY-102',
    aisle: 'West Wing Row 02 (QC173 – QC200)',
    callNumberRange: 'QC174.12 .N54 – QC174.45 .P47',
    department: 'Physics',
    bookTitles: [
      'Quantum Computation and Quantum Information',
      'Principles of Quantum Mechanics (Shankar)',
      'Introduction to Quantum Mechanics (Griffiths)',
    ],
  },
  {
    shelfId: 'MAT-101',
    section: 'Pure Mathematics & Analysis',
    floor: 1,
    x: 135,
    y: 650,
    orientation: 'horizontal',
    partitions: buildPartitions('MAT-101', [
      'Real Analysis',
      'Complex Variables',
      'Metric Topology',
      'Measure Theory',
      'Functional Spaces',
    ]),
    label: 'MAT-101',
    aisle: 'West Wing Row 03 (QA300 – QA331)',
    callNumberRange: 'QA300 .R8 – QA331 .C45',
    department: 'Mathematics',
    bookTitles: [
      'Principles of Mathematical Analysis (Rudin)',
      'Real and Complex Analysis',
      'Topology (Munkres)',
    ],
  },
  {
    shelfId: 'MAT-102',
    section: 'Linear Algebra & Statistics',
    floor: 1,
    x: 135,
    y: 755,
    orientation: 'horizontal',
    partitions: buildPartitions('MAT-102', [
      'Vector Spaces',
      'Spectral Operators',
      'Bayesian Models',
      'MCMC Simulation',
      'Probability Theory',
    ]),
    label: 'MAT-102',
    aisle: 'South-West Row 04 (QA184 – QA279)',
    callNumberRange: 'QA184.2 .A95 – QA279.5 .M39',
    department: 'Mathematics',
    bookTitles: [
      'Linear Algebra Done Right (Axler)',
      'Statistical Rethinking (McElreath)',
      'Introduction to Probability (Blitzstein)',
    ],
  },
  {
    shelfId: 'ECO-101',
    section: 'Economics & Decision Science',
    floor: 1,
    x: 245,
    y: 850,
    orientation: 'vertical',
    partitions: buildPartitions('ECO-101', [
      'Microeconomics',
      'Game Theory',
      'Behavioral Econ',
      'Prospect Theory',
      'Econometrics',
    ]),
    label: 'ECO-101',
    aisle: 'South-West Vertical Stack (HB139 – BF441)',
    callNumberRange: 'HB139 .H55 – BF441 .K238',
    department: 'Economics',
    bookTitles: [
      'Microeconomic Theory (Mas-Colell)',
      'Thinking, Fast and Slow',
      'Principles of Econometrics',
    ],
  },
  {
    shelfId: 'REF-101',
    section: 'Reference & Course Reserves',
    floor: 1,
    x: 425,
    y: 190,
    orientation: 'horizontal',
    partitions: buildPartitions('REF-101', [
      'New Arrivals',
      '2-Hour Reserves',
      'Faculty Picks',
      'Handbooks',
      'Citation Guides',
    ]),
    label: 'REF-101',
    aisle: 'North Center Row 01 (Check-In Zone)',
    callNumberRange: 'Z1001 .A1 – Z7999 .R4',
    department: 'General Reference',
    bookTitles: [
      'Course Reserve Collection',
      'Chicago Manual of Style',
      'IEEE Reference Guides',
    ],
  },
  {
    shelfId: 'BIO-101',
    section: 'Biological Sciences & Genetics',
    floor: 1,
    x: 425,
    y: 335,
    orientation: 'horizontal',
    partitions: buildPartitions('BIO-101', [
      'Cell Biology',
      'Biochemistry',
      'Molecular Genetics',
      'Neurobiology',
      'Systems Bio',
    ]),
    label: 'BIO-101',
    aisle: 'Center Stack Row 02 (QH430 – QH506)',
    callNumberRange: 'QH430 .L48 – QH506 .A42',
    department: 'Biology',
    bookTitles: [
      'Molecular Biology of the Cell (Alberts)',
      'Lehninger Principles of Biochemistry',
      'Genetics: Analysis and Principles',
    ],
  },
  {
    shelfId: 'BIO-102',
    section: 'Environmental & Earth Sciences',
    floor: 1,
    x: 425,
    y: 480,
    orientation: 'horizontal',
    partitions: buildPartitions('BIO-102', [
      'Environmental Eng',
      'Hydrology',
      'Atmospheric Sci',
      'Ecology',
      'Sustainability',
    ]),
    label: 'BIO-102',
    aisle: 'Center Stack Row 03 (TD145 – TD195)',
    callNumberRange: 'TD145 .M38 – TD195 .W38',
    department: 'Environmental Science',
    bookTitles: [
      'Environmental Engineering: Fundamentals',
      'Water Resources Engineering',
      'Principles of Hydrology',
    ],
  },
  {
    shelfId: 'CIV-101',
    section: 'Civil & Structural Engineering',
    floor: 1,
    x: 425,
    y: 625,
    orientation: 'horizontal',
    partitions: buildPartitions('CIV-101', [
      'Structural Analysis',
      'Matrix Stiffness',
      'Soil Mechanics',
      'Foundations',
      'Reinforced Concrete',
    ]),
    label: 'CIV-101',
    aisle: 'Center Stack Row 04 (TA645 – TA710)',
    callNumberRange: 'TA645 .H54 – TA710 .B78',
    department: 'Civil Engineering',
    bookTitles: [
      'Structural Analysis (Hibbeler)',
      'Soil Mechanics and Foundations',
      'Design of Concrete Structures',
    ],
  },
  {
    shelfId: 'ARC-101',
    section: 'Special Collections & Theses',
    floor: 1,
    x: 425,
    y: 770,
    orientation: 'horizontal',
    partitions: buildPartitions('ARC-101', [
      'Doctoral Theses',
      'Rare Folios',
      'Archival Maps',
      'University Press',
      'Periodicals',
    ]),
    label: 'ARC-101',
    aisle: 'South Center Row 05 (South Cabin Zone)',
    callNumberRange: 'AC1 .K5 – AS36 .U5',
    department: 'Archives',
    bookTitles: [
      'Doctoral Dissertations Archive',
      'Special Collections Folio Catalogue',
      'University Historical Monographs',
    ],
  },
];

export const CENTRAL_LIBRARY_LANDMARKS: MapLandmark[] = [
  // =========================================================================
  // FLOOR 1 LANDMARKS (Matches LIBRARY 1st floor blueprint)
  // =========================================================================
  {
    id: 'lm-f1-computer',
    name: 'Computer Area & Workstations',
    type: 'computer_area',
    floor: 1,
    x: 168,
    y: 132,
    width: 215,
    height: 165,
    label: 'COMPUTER AREA',
  },
  {
    id: 'lm-f1-cabin-north',
    name: 'North Faculty Study Cabin',
    type: 'cabin',
    floor: 1,
    x: 388,
    y: 85,
    width: 155,
    height: 70,
    label: 'CABIN',
  },
  {
    id: 'lm-f1-checkin',
    name: 'Check-In & Self-Checkout Kiosk',
    type: 'check_in',
    floor: 1,
    x: 575,
    y: 88,
    width: 140,
    height: 75,
    label: 'CHECK IN',
  },
  {
    id: 'lm-f1-entrance',
    name: 'Main Entrance',
    type: 'entrance',
    floor: 1,
    x: 695,
    y: 175,
    width: 80,
    height: 44,
    label: 'ENTRANCE',
  },
  {
    id: 'lm-f1-helpdesk',
    name: 'Help Desk & Reference Concierge',
    type: 'help_desk',
    floor: 1,
    x: 672,
    y: 405,
    width: 135,
    height: 360,
    label: 'HELP DESK',
  },
  {
    id: 'lm-f1-stairs',
    name: 'Curved Grand Staircase',
    type: 'stairs',
    floor: 1,
    x: 270,
    y: 465,
    width: 110,
    height: 420,
    label: 'STAIRS',
  },
  {
    id: 'lm-f1-cabin-south',
    name: 'South Quiet Cabin',
    type: 'cabin',
    floor: 1,
    x: 435,
    y: 898,
    width: 160,
    height: 85,
    label: 'CABIN',
  },
  // Floor 1 Study Desks (3 West Wing + 3 Center Wing)
  { id: 'lm-f1-desk-w1', name: 'West Study Desk 1', type: 'study_desk', floor: 1, x: 135, y: 292, width: 120, height: 28, label: 'DESK' },
  { id: 'lm-f1-desk-w2', name: 'West Study Desk 2', type: 'study_desk', floor: 1, x: 135, y: 438, width: 120, height: 28, label: 'DESK' },
  { id: 'lm-f1-desk-w3', name: 'West Study Desk 3', type: 'study_desk', floor: 1, x: 135, y: 580, width: 120, height: 28, label: 'DESK' },
  { id: 'lm-f1-desk-c1', name: 'Center Study Desk 1', type: 'study_desk', floor: 1, x: 425, y: 262, width: 125, height: 28, label: 'DESK' },
  { id: 'lm-f1-desk-c2', name: 'Center Study Desk 2', type: 'study_desk', floor: 1, x: 425, y: 408, width: 125, height: 28, label: 'DESK' },
  { id: 'lm-f1-desk-c3', name: 'Center Study Desk 3', type: 'study_desk', floor: 1, x: 425, y: 552, width: 125, height: 28, label: 'DESK' },

  // =========================================================================
  // FLOOR 2 LANDMARKS (Matches LIBRARY 2nd floor blueprint)
  // =========================================================================
  {
    id: 'lm-f2-stairs-upper',
    name: 'North Stairwell Entry',
    type: 'stairs',
    floor: 2,
    x: 92,
    y: 238,
    width: 72,
    height: 80,
    label: 'STAIRS ↓',
  },
  {
    id: 'lm-f2-stairs-lower',
    name: 'South Stairwell Entry',
    type: 'stairs',
    floor: 2,
    x: 92,
    y: 748,
    width: 72,
    height: 80,
    label: 'STAIRS ↑',
  },
  // Floor 2 Study Desks (4 Central Spine Desks)
  { id: 'lm-f2-desk-1', name: 'Floor 2 Study Desk 1', type: 'study_desk', floor: 2, x: 420, y: 158, width: 130, height: 30, label: 'DESK' },
  { id: 'lm-f2-desk-2', name: 'Floor 2 Study Desk 2', type: 'study_desk', floor: 2, x: 420, y: 412, width: 130, height: 30, label: 'DESK' },
  { id: 'lm-f2-desk-3', name: 'Floor 2 Study Desk 3', type: 'study_desk', floor: 2, x: 420, y: 600, width: 130, height: 30, label: 'DESK' },
  { id: 'lm-f2-desk-4', name: 'Floor 2 Study Desk 4', type: 'study_desk', floor: 2, x: 420, y: 845, width: 130, height: 30, label: 'DESK' },
];

export const ENTRANCE_POINT = { x: 675, y: 175 };

/**
 * Pre-defined canonical route for Shelf CS-204 aligned to the actual 2-floor blueprint
 */
export const DEFAULT_CS204_ROUTE: WayfindingRoute = {
  destinationShelfId: 'CS-204',
  destinationBookTitle: 'Data Structures Using C',
  destinationFloor: 2,
  estimatedWalkingTime: '2 min',
  totalDistanceMeters: 85,
  steps: [
    {
      stepNumber: 1,
      instruction: 'Enter through Main Entrance past Check-In Desk',
      floor: 1,
      point: { x: 675, y: 175 },
      landmark: 'Main Entrance (East Wall)',
    },
    {
      stepNumber: 2,
      instruction: 'Walk west past North Cabin and take Curved Stairs to Floor 2',
      floor: 1,
      point: { x: 255, y: 445 },
      landmark: 'Curved Grand Staircase',
    },
    {
      stepNumber: 3,
      instruction: 'Enter Floor 2 via South Stairway Opening and head east',
      floor: 2,
      point: { x: 145, y: 748 },
      landmark: 'South Stairwell Entry (Floor 2)',
    },
    {
      stepNumber: 4,
      instruction: 'Continue east along aisle to Shelf CS-204',
      floor: 2,
      point: { x: 420, y: 695 },
      landmark: 'Shelf CS-204 (Partitions A–E)',
    },
  ],
  pathByFloor: {
    1: [
      { x: 675, y: 175 }, // Main entrance doorway
      { x: 545, y: 175 }, // Clear of Help Desk / Check-in
      { x: 545, y: 226 }, // North center concourse
      { x: 315, y: 226 }, // Top of curved stairs
      { x: 255, y: 445 }, // Stairway landing
    ],
    2: [
      { x: 105, y: 748 }, // Floor 2 lower stairway corridor
      { x: 420, y: 748 }, // Walk east between CS-204 and Desk 4
      { x: 420, y: 695 }, // Arrive at Shelf CS-204
    ],
  },
};

/**
 * Helper to resolve the correct Central Library shelf ID for any Book
 */
export function getShelfIdForBook(book: {
  id?: string;
  title?: string;
  department?: string;
  category?: string;
  location?: { shelf?: string; callNumber?: string };
}): string {
  if (book.location?.shelf) {
    const match = book.location.shelf.match(/(CS|PHY|MAT|ENG|BIO|LIT|ECO|CIV|REF|ARC)-[0-9]{3}/i);
    if (match) {
      const code = match[0].toUpperCase();
      return code === 'LIT-202' ? 'LIT-201' : code;
    }
  }
  if (book.location?.callNumber) {
    const cn = book.location.callNumber.toUpperCase();
    if (cn.includes('QA76.76') || cn.includes('OPERATING')) return 'CS-204';
    if (cn.includes('QA76.6') || cn.includes('ALGORITHMS')) return 'CS-202';
    if (cn.includes('QA76.9') || cn.includes('DATA-INTENSIVE')) return 'CS-203';
    if (cn.includes('QA76')) return 'CS-201';
    if (cn.includes('QC174') || cn.includes('QC173') || cn.includes('QUANTUM')) return 'PHY-102';
    if (cn.includes('QC') || cn.includes('QA805')) return 'PHY-101';
    if (cn.includes('QA184') || cn.includes('QA279') || cn.includes('STATISTICS')) return 'MAT-102';
    if (cn.includes('QA300') || cn.includes('MATH')) return 'MAT-101';
    if (cn.includes('TK')) return 'ENG-201';
    if (cn.includes('TJ') || cn.includes('TA357')) return 'ENG-202';
    if (cn.includes('TA645') || cn.includes('TA710') || cn.includes('TA683')) return 'CIV-101';
    if (cn.includes('HB') || cn.includes('BF441')) return 'ECO-101';
    if (cn.includes('QH')) return 'BIO-101';
    if (cn.includes('TD')) return 'BIO-102';
    if (cn.includes('PR') || cn.includes('PN') || cn.includes('PE') || cn.includes('BJ')) return 'LIT-201';
  }
  const dept = (book.department || '').toLowerCase();
  const cat = (book.category || '').toLowerCase();
  const title = (book.title || '').toLowerCase();

  if (title.includes('operating') || title.includes('data structures')) return 'CS-204';
  if (dept.includes('computer') || dept.includes('computing')) {
    if (cat.includes('algorithm')) return 'CS-202';
    if (cat.includes('database') || cat.includes('distributed')) return 'CS-203';
    return 'CS-201';
  }
  if (dept.includes('physics')) {
    if (cat.includes('quantum')) return 'PHY-102';
    return 'PHY-101';
  }
  if (dept.includes('math')) {
    if (cat.includes('linear') || cat.includes('stat')) return 'MAT-102';
    return 'MAT-101';
  }
  if (dept.includes('econ')) return 'ECO-101';
  if (dept.includes('civil')) return 'CIV-101';
  if (dept.includes('environ')) return 'BIO-102';
  if (dept.includes('bio')) return 'BIO-101';
  if (dept.includes('electron') || dept.includes('circuit')) return 'ENG-201';
  if (dept.includes('mechanic')) return 'ENG-202';
  if (dept.includes('eng') || dept.includes('lit') || dept.includes('phil') || dept.includes('ethic')) return 'LIT-201';

  return 'CS-204';
}

/**
 * Generate accurate corridor-following routes for any shelf in the actual 2-floor blueprint
 */
export function generateRouteForShelf(
  shelfId: string,
  bookTitle?: string,
  customShelves?: ShelfCoordinate[]
): WayfindingRoute {
  let allShelves = customShelves || CENTRAL_LIBRARY_SHELVES;
  if (!customShelves && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(SHELF_STORAGE_KEY);
      if (raw) allShelves = JSON.parse(raw);
    } catch {}
  }

  let cleanId = shelfId.toUpperCase().trim();
  if (cleanId === 'LIT-202') cleanId = 'LIT-201';

  const shelf =
    allShelves.find((s) => s.shelfId.toUpperCase() === cleanId) ||
    allShelves.find((s) => s.shelfId === 'CS-204') ||
    CENTRAL_LIBRARY_SHELVES[4];

  const resolvedBookTitle = bookTitle || (shelf.bookTitles && shelf.bookTitles[0]) || 'Academic Monograph';

  // Canonical CS-204 route (adapting dynamically if Admin moved CS-204)
  if (shelf.shelfId === 'CS-204') {
    const isUpper = shelf.y < 460;
    const stairEntry = isUpper ? { x: 105, y: 238 } : { x: 105, y: 748 };
    const crossY = isUpper ? 238 : 748;
    const approachY = shelf.y > 700 ? shelf.y - 45 : crossY;

    return {
      ...DEFAULT_CS204_ROUTE,
      destinationBookTitle: resolvedBookTitle,
      steps: [
        DEFAULT_CS204_ROUTE.steps[0],
        DEFAULT_CS204_ROUTE.steps[1],
        {
          ...DEFAULT_CS204_ROUTE.steps[2],
          point: { x: 145, y: crossY },
          landmark: isUpper ? 'North Stairwell Entry (Floor 2)' : 'South Stairwell Entry (Floor 2)',
        },
        {
          ...DEFAULT_CS204_ROUTE.steps[3],
          point: { x: shelf.x, y: shelf.y },
        },
      ],
      pathByFloor: {
        1: DEFAULT_CS204_ROUTE.pathByFloor[1],
        2: [
          stairEntry,
          { x: shelf.x, y: approachY },
          { x: shelf.x, y: shelf.y },
        ],
      },
    };
  }

  // =========================================================================
  // DESTINATION ON FLOOR 1
  // =========================================================================
  if (shelf.floor === 1) {
    const isWestWing = shelf.x < 300;
    const spineX = 548; // Clear vertical corridor between Center Stacks and Help Desk

    let floor1Path: { x: number; y: number }[];
    let corridorLandmark = 'East Main Concourse (Help Desk Side)';

    if (!isWestWing) {
      // Center Wing shelves: approach from East Main Concourse
      const approachY = shelf.y < 230 ? 226 : shelf.y - 34;
      floor1Path = [
        ENTRANCE_POINT,
        { x: spineX, y: ENTRANCE_POINT.y },
        { x: spineX, y: approachY },
        { x: shelf.x, y: approachY },
        { x: shelf.x, y: shelf.y },
      ];
    } else {
      // West Wing shelves: pass North of curved stairs (y=226) or South of stairs (y=712)
      const useSouthRoute = shelf.y > 680;
      const westAisleX = 222; // Clear aisle between West Wing shelves and curved stairs
      if (useSouthRoute) {
        corridorLandmark = 'South Concourse Passage';
        floor1Path = [
          ENTRANCE_POINT,
          { x: spineX, y: ENTRANCE_POINT.y },
          { x: spineX, y: 712 },
          { x: westAisleX, y: 712 },
          { x: westAisleX, y: shelf.y },
          { x: shelf.x, y: shelf.y },
        ];
      } else {
        corridorLandmark = 'North Concourse Passage (by Computer Area)';
        floor1Path = [
          ENTRANCE_POINT,
          { x: spineX, y: ENTRANCE_POINT.y },
          { x: spineX, y: 226 },
          { x: westAisleX, y: 226 },
          { x: westAisleX, y: shelf.y },
          { x: shelf.x, y: shelf.y },
        ];
      }
    }

    const steps = [
      {
        stepNumber: 1,
        instruction: 'Enter through Main Entrance past Check-In',
        floor: 1 as LibraryFloor,
        point: ENTRANCE_POINT,
        landmark: 'Main Entrance (East Wall)',
      },
      {
        stepNumber: 2,
        instruction: `Walk along ${corridorLandmark} past Help Desk`,
        floor: 1 as LibraryFloor,
        point: floor1Path[2],
        landmark: corridorLandmark,
      },
      {
        stepNumber: 3,
        instruction: `Turn toward ${shelf.section} (${shelf.aisle || 'Stacks'})`,
        floor: 1 as LibraryFloor,
        point: floor1Path[3],
        landmark: `${shelf.section}`,
      },
      {
        stepNumber: 4,
        instruction: `Arrive at Shelf ${shelf.shelfId} (Partitions A–E)`,
        floor: 1 as LibraryFloor,
        point: { x: shelf.x, y: shelf.y },
        landmark: `Shelf ${shelf.shelfId}`,
      },
    ];

    return {
      destinationShelfId: shelf.shelfId,
      destinationBookTitle: resolvedBookTitle,
      destinationFloor: 1,
      estimatedWalkingTime: '1 min',
      totalDistanceMeters: isWestWing ? 55 : 38,
      steps,
      pathByFloor: {
        1: floor1Path,
      },
    };
  }

  // =========================================================================
  // DESTINATION ON FLOOR 2
  // =========================================================================
  const useNorthStair = shelf.y < 450;
  const stairCrossY = useNorthStair ? 238 : 748;
  const stairCorridorPoint = { x: 105, y: stairCrossY };
  const stairDoorPoint = { x: 145, y: stairCrossY };

  const floor1Path = [
    ENTRANCE_POINT,
    { x: 548, y: ENTRANCE_POINT.y },
    { x: 548, y: 226 },
    { x: 315, y: 226 },
    { x: 255, y: 445 },
  ];

  // Pick clear North-South lane in Floor 2 (West lane x=275, East lane x=565)
  let floor2Path: { x: number; y: number }[];
  if (shelf.x < 300 && shelf.y < 200) {
    // CS-201 top-left
    floor2Path = [
      stairCorridorPoint,
      { x: 225, y: stairCrossY },
      { x: shelf.x, y: shelf.y },
    ];
  } else if (shelf.x > 540 && shelf.y < 200) {
    // ENG-201 top-right
    floor2Path = [
      stairCorridorPoint,
      { x: 275, y: stairCrossY },
      { x: 275, y: 125 },
      { x: shelf.x, y: 125 },
      { x: shelf.x, y: shelf.y },
    ];
  } else if (shelf.x < 300 && shelf.y > 700) {
    // ENG-202 bottom-left vertical
    floor2Path = [
      stairCorridorPoint,
      { x: 235, y: stairCrossY },
      { x: 235, y: shelf.y },
      { x: shelf.x, y: shelf.y },
    ];
  } else if (shelf.x > 540 && shelf.y > 700) {
    // LIT-201 bottom-right vertical
    floor2Path = [
      stairCorridorPoint,
      { x: 585, y: stairCrossY },
      { x: 585, y: shelf.y },
      { x: shelf.x, y: shelf.y },
    ];
  } else {
    // Central spine horizontal shelves (CS-202, CS-203, etc.)
    const approachX = 275;
    const approachY = shelf.y;
    floor2Path = [
      stairCorridorPoint,
      { x: approachX, y: stairCrossY },
      { x: approachX, y: approachY },
      { x: shelf.x, y: shelf.y },
    ];
  }

  const steps = [
    {
      stepNumber: 1,
      instruction: 'Enter through Main Entrance on Floor 1',
      floor: 1 as LibraryFloor,
      point: ENTRANCE_POINT,
      landmark: 'Main Entrance (East Wall)',
    },
    {
      stepNumber: 2,
      instruction: 'Walk west past Check-In and take Curved Stairs up to Floor 2',
      floor: 1 as LibraryFloor,
      point: { x: 255, y: 445 },
      landmark: 'Curved Grand Staircase',
    },
    {
      stepNumber: 3,
      instruction: `Exit ${useNorthStair ? 'North' : 'South'} Stairwell onto Floor 2 toward ${shelf.section}`,
      floor: 2 as LibraryFloor,
      point: stairDoorPoint,
      landmark: useNorthStair ? 'North Stairwell Entry' : 'South Stairwell Entry',
    },
    {
      stepNumber: 4,
      instruction: `Continue to Shelf ${shelf.shelfId} (Partitions A–E)`,
      floor: 2 as LibraryFloor,
      point: { x: shelf.x, y: shelf.y },
      landmark: `Shelf ${shelf.shelfId}`,
    },
  ];

  return {
    destinationShelfId: shelf.shelfId,
    destinationBookTitle: resolvedBookTitle,
    destinationFloor: 2,
    estimatedWalkingTime: '2 min',
    totalDistanceMeters: 85,
    steps,
    pathByFloor: {
      1: floor1Path,
      2: floor2Path,
    },
  };
}
