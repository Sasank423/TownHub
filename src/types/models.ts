
export type BookStatus = 'available' | 'reserved' | 'checked-out';
export type ReservationType = 'book' | 'room';
export type ReservationStatus = 'Pending' | 'Approved' | 'Declined' | 'Completed';
export type RoomAmenity = 
  | 'wifi' 
  | 'projector' 
  | 'whiteboard' 
  | 'computers'
  | 'videoconferencing'
  | 'printer'
  | 'study-pods'
  | 'silence';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  pageCount: number;
  publicationYear: number;
  publisher: string;
  genres: string[];
  isbn: string;
  language: string;
  copies: BookCopy[];
  addedDate: string;
  rating: number;
}

export interface BookCopy {
  id: string;
  bookId: string;
  status: BookStatus;
  location: string;
  condition: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  amenities: RoomAmenity[];
  images: string[];
  availabilitySchedule: RoomAvailability[];
  floorMapPosition: { x: number; y: number };
}

export interface RoomAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Reservation {
  id: string;
  userId: string;
  itemId: string;
  itemType: ReservationType;
  title: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  relatedReservationId?: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  itemId?: string;
  itemType?: string;
}
