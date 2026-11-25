/**
 * Kite ILS - Centralized Shelf & Stacks GIS Service
 * Single source of truth for library spatial hierarchy:
 * Library -> Building -> Floor -> Section -> Shelf -> Partitions -> Coordinates
 * Shared between Admin Map Manager and Student Spatial Wayfinding
 */
import { ShelfCoordinate, LibraryFloor } from '../types';
import { CENTRAL_LIBRARY_SHELVES, SHELF_STORAGE_KEY, buildPartitions } from '../data/wayfindingData';

const SHELVES_UPDATED_EVENT = 'kite_ils_shelves_updated';

// Enrich default shelves with Category, Building, and Library hierarchy fields
function getEnrichedDefaults(): ShelfCoordinate[] {
  return CENTRAL_LIBRARY_SHELVES.map((s) => ({
    ...s,
    orientation: s.orientation || 'horizontal',
    partitions: s.partitions || buildPartitions(s.shelfId),
    library: 'Central Library',
    building: 'Main University Library',
    category:
      s.shelfId.startsWith('CS') ? 'Computer Science & Software' :
      s.shelfId.startsWith('PHY') ? 'Physics & Classical Mechanics' :
      s.shelfId.startsWith('MAT') ? 'Mathematics & Statistics' :
      s.shelfId.startsWith('ECO') ? 'Economics & Behavioral Science' :
      s.shelfId.startsWith('ENG') ? 'Engineering & Applied Systems' :
      s.shelfId.startsWith('BIO') ? 'Biological & Environmental Sciences' :
      s.shelfId.startsWith('CIV') ? 'Civil & Structural Engineering' :
      s.shelfId.startsWith('REF') ? 'Reference & Course Reserves' :
      s.shelfId.startsWith('ARC') ? 'Special Collections & Theses' :
      'Humanities & Academic Writing',
  }));
}

export class MockShelfService {
  private static getStoredShelves(): ShelfCoordinate[] {
    try {
      const data = localStorage.getItem(SHELF_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as ShelfCoordinate[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => ({
            ...s,
            orientation: s.orientation || 'horizontal',
            partitions: s.partitions && s.partitions.length > 0 ? s.partitions : buildPartitions(s.shelfId),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored shelves', e);
    }
    const defaults = getEnrichedDefaults();
    try {
      localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  private static saveShelves(shelves: ShelfCoordinate[]): void {
    try {
      localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(shelves));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SHELVES_UPDATED_EVENT, { detail: shelves }));
      }
    } catch (e) {
      console.warn('Failed to save shelves', e);
    }
  }

  static getAllShelves(): ShelfCoordinate[] {
    return this.getStoredShelves();
  }

  static getShelvesByFloor(floor: LibraryFloor): ShelfCoordinate[] {
    return this.getStoredShelves().filter((s) => s.floor === floor);
  }

  static getShelfById(shelfId: string): ShelfCoordinate | undefined {
    let clean = shelfId.toUpperCase().trim();
    if (clean === 'LIT-202') clean = 'LIT-201';
    return this.getStoredShelves().find((s) => s.shelfId.toUpperCase() === clean);
  }

  static updateCoordinates(shelfId: string, x: number, y: number): ShelfCoordinate | null {
    const shelves = this.getStoredShelves();
    const clean = shelfId.toUpperCase().trim();
    const idx = shelves.findIndex((s) => s.shelfId.toUpperCase() === clean);
    if (idx === -1) return null;

    // Constrain to portrait architectural floor plan bounds (800x1000)
    const clampedX = Math.round(Math.max(85, Math.min(715, x)));
    const clampedY = Math.round(Math.max(70, Math.min(920, y)));

    shelves[idx] = {
      ...shelves[idx],
      x: clampedX,
      y: clampedY,
    };

    this.saveShelves(shelves);
    return shelves[idx];
  }

  static updateShelf(shelfId: string, updates: Partial<ShelfCoordinate>): ShelfCoordinate | null {
    const shelves = this.getStoredShelves();
    const clean = shelfId.toUpperCase().trim();
    const idx = shelves.findIndex((s) => s.shelfId.toUpperCase() === clean);
    if (idx === -1) return null;

    const nextId = updates.shelfId ? updates.shelfId.toUpperCase().trim() : shelves[idx].shelfId;
    shelves[idx] = {
      ...shelves[idx],
      ...updates,
      shelfId: nextId,
      partitions: updates.partitions || shelves[idx].partitions || buildPartitions(nextId),
    };

    this.saveShelves(shelves);
    return shelves[idx];
  }

  static addShelf(shelfData: ShelfCoordinate): ShelfCoordinate {
    const shelves = this.getStoredShelves();
    const cleanId = shelfData.shelfId.toUpperCase().trim();

    const existingIdx = shelves.findIndex((s) => s.shelfId.toUpperCase() === cleanId);
    const newShelf: ShelfCoordinate = {
      ...shelfData,
      shelfId: cleanId,
      orientation: shelfData.orientation || 'horizontal',
      partitions: shelfData.partitions && shelfData.partitions.length > 0 ? shelfData.partitions : buildPartitions(cleanId),
      library: shelfData.library || 'Central Library',
      building: shelfData.building || 'Main University Library',
      category: shelfData.category || `${shelfData.section} Collection`,
      x: Math.round(Math.max(85, Math.min(715, shelfData.x))),
      y: Math.round(Math.max(70, Math.min(920, shelfData.y))),
    };

    if (existingIdx >= 0) {
      shelves[existingIdx] = newShelf;
    } else {
      shelves.push(newShelf);
    }

    this.saveShelves(shelves);
    return newShelf;
  }

  static deleteShelf(shelfId: string): boolean {
    const shelves = this.getStoredShelves();
    const clean = shelfId.toUpperCase().trim();
    const filtered = shelves.filter((s) => s.shelfId.toUpperCase() !== clean);
    if (filtered.length === shelves.length) return false;

    this.saveShelves(filtered);
    return true;
  }

  static resetToDefaults(): ShelfCoordinate[] {
    const defaults = getEnrichedDefaults();
    this.saveShelves(defaults);
    return defaults;
  }

  static subscribe(callback: (shelves: ShelfCoordinate[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ShelfCoordinate[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(SHELVES_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(SHELVES_UPDATED_EVENT, handler);
    };
  }
}
