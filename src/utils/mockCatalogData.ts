import { Book, Room, BookStatus, RoomAmenity } from '../types/models';
import * as BookService from '../services/bookService';
import * as RoomService from '../services/roomService';

// Re-export the service methods with the same names as before
export const getBookById = async (id: string): Promise<Book | undefined> => {
  const book = await BookService.getBookById(id);
  return book || undefined;
};

export const getRoomById = async (id: string): Promise<Room | undefined> => {
  const room = await RoomService.getRoomById(id);
  return room || undefined;
};

export const getAvailableBookCopiesCount = async (bookId: string): Promise<number> => {
  return await BookService.getAvailableBookCopiesCount(bookId);
};

export const searchBooks = async (
  query: string,
  filters: {
    genres?: string[];
    availability?: BookStatus;
    sortBy?: 'title' | 'author' | 'publicationYear' | 'addedDate';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<Book[]> => {
  return await BookService.searchBooks(query, filters);
};

export const getAllGenres = async (): Promise<string[]> => {
  return await BookService.getAllGenres();
};

export const searchRooms = async (
  query: string,
  filters: {
    capacity?: number;
    amenities?: RoomAmenity[];
    date?: string;
  } = {}
): Promise<Room[]> => {
  return await RoomService.searchRooms(query, filters);
};

export const getAllAmenities = async (): Promise<RoomAmenity[]> => {
  return await RoomService.getAllAmenities();
};

// For backwards compatibility, we'll keep these variables but they'll 
// be empty arrays - the components should now use the async functions instead
export const mockBooks: Book[] = [];
export const mockRooms: Room[] = [];
