/**
 * Kite ILS - Type Definitions
 * Modern University Integrated Library System
 */

export type BookAvailabilityStatus = 
  | 'available_shelf' 
  | 'reserved_hold' 
  | 'checked_out' 
  | 'in_transit' 
  | 'reference_only';

export type BookFormat = 'physical' | 'ebook' | 'audiobook' | 'journal' | 'thesis';

export interface ShelfLocation {
  library: string; // e.g. 'Science & Engineering Library'
  building: string; // e.g. 'Alan Turing Hall'
  floor: string; // e.g. 'Floor 3'
  zone: string; // e.g. 'West Stacks'
  aisle: string; // e.g. 'Aisle 14'
  shelf: string; // e.g. 'Shelf B-04'
  callNumber: string; // Library of Congress or Dewey, e.g. 'QA76.73 .P98 2024'
  coordinates?: { x: number; y: number }; // For spatial wayfinding 2D/3D map
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string; // Primary author name
  authors: string[]; // List of contributors/authors
  publicationYear: number;
  publisher: string;
  edition?: string;
  isbn: string;
  category: string; // Primary subject / discipline
  department: string; // Academic department: Computer Science, Mathematics, etc.
  description: string; // Academic description / synopsis
  abstract: string; // Compatibility field
  subjects: string[];
  formats: BookFormat[];
  cover: string; // Cover palette / artwork motif
  coverColor: string; // Visual accent for catalog fallback
  location: ShelfLocation;
  totalCopies: number;
  availableCopies: number;
  status: BookAvailabilityStatus;
  digitalAvailable: boolean; // Instant e-reader availability
  digitalAccessUrl?: string;
  resourceType: 'Book' | 'Research Monograph' | 'Course Reserve' | 'Journal Volume';
  dateAdded: string; // YYYY-MM-DD for sorting by recently added
  rating?: number;
  reviewCount?: number;
}

export type CopyStatus = 'Available' | 'Reserved' | 'Borrowed' | 'Processing';

export interface PhysicalBookCopy {
  copyId: string;
  barcode: string;
  status: CopyStatus;
  location: string;
  callNumber: string;
  dueDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair';
}

export interface DetailedBookCopy {
  copyId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  status: CopyStatus;
  shelf: string;
  accessionNumber: string;
  barcode: string;
  department: string;
  condition?: 'Excellent' | 'Good' | 'Fair';
  lastInspected?: string;
  acquiredDate?: string;
}

export type ReservationStatus = 
  | 'ready_for_pickup' 
  | 'active'
  | 'in_retrieval' 
  | 'in_transit' 
  | 'queued' 
  | 'expired'
  | 'completed' 
  | 'cancelled';

export interface Reservation {
  id: string; // e.g. 'KIT-28492'
  reservationId: string; // e.g. 'KIT-28492'
  claimToken: string; // e.g. 'KITE-4821'
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookAuthors: string[];
  studentName?: string;
  studentId?: string;
  callNumber: string;
  library: string;
  pickupLocation: string;
  pickupLocker?: string;
  shelf: string;
  copyId?: string;
  queuePosition?: number;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string;
  readyAt?: string;
  reservationDuration?: string;
}

export interface LoanRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthors: string[];
  callNumber: string;
  borrowedDate: string;
  dueDate: string;
  renewalsRemaining: number;
  isOverdue: boolean;
  readingProgress?: number; // 0-100% for digital / synced reader
}

export type AcquisitionStatus = 'under_review' | 'faculty_endorsed' | 'ordered' | 'cataloging' | 'available';

export interface AcquisitionRequest {
  id: string;
  title: string;
  authors: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  department: string;
  requestedBy: string;
  requestedAt: string;
  courseCode?: string;
  urgency: 'routine' | 'course_reserve' | 'urgent_research';
  status: AcquisitionStatus;
  notes?: string;
  reason?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'reservation_ready' | 'due_reminder' | 'acquisition_update' | 'system';
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'researcher' | 'faculty' | 'librarian';
  department: string;
  patronNumber: string;
  activeLoansCount: number;
  reservationsCount: number;
  finesDue: number;
}

export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

export type LibraryFloor = 1 | 2;

export type ShelfOrientation = 'horizontal' | 'vertical';

export interface ShelfPartition {
  partitionId: string; // e.g. 'CS-204-A'
  code: string; // e.g. 'A', 'B', 'C', 'D', 'E'
  label?: string;
  callNumberRange?: string;
}

export interface ShelfCoordinate {
  shelfId: string;
  section: string;
  floor: LibraryFloor;
  x: number;
  y: number;
  orientation?: ShelfOrientation;
  partitions?: ShelfPartition[];
  label?: string;
  aisle?: string;
  callNumberRange?: string;
  bookTitles?: string[];
  department?: string;
  category?: string;
  building?: string;
  library?: string;
}

export interface MapLandmark {
  id: string;
  name: string;
  type:
    | 'entrance'
    | 'stairs'
    | 'elevator'
    | 'reading_area'
    | 'service_desk'
    | 'lockers'
    | 'restrooms'
    | 'cafe'
    | 'computer_area'
    | 'cabin'
    | 'check_in'
    | 'help_desk'
    | 'study_desk';
  floor: LibraryFloor;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  floor: LibraryFloor;
  point: { x: number; y: number };
  landmark?: string;
}

export interface WayfindingRoute {
  destinationShelfId: string;
  destinationBookTitle: string;
  destinationFloor: LibraryFloor;
  estimatedWalkingTime: string;
  totalDistanceMeters: number;
  steps: RouteStep[];
  pathByFloor: {
    1?: { x: number; y: number }[];
    2?: { x: number; y: number }[];
  };
}
