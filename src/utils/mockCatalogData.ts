
import { Book, Room, BookStatus, RoomAmenity } from '../types/models';

// Helper function to generate random book copies with different statuses
const generateBookCopies = (bookId: string, count: number) => {
  const statuses: BookStatus[] = ['available', 'reserved', 'checked-out'];
  const conditions = ['New', 'Good', 'Fair', 'Poor'];
  const locations = ['Main Floor - Section A', 'Main Floor - Section B', 'Second Floor', 'Archives'];
  
  return Array.from({ length: count }).map((_, index) => ({
    id: `copy-${bookId}-${index}`,
    bookId,
    status: statuses[Math.floor(Math.random() * statuses.length)] as BookStatus,
    location: locations[Math.floor(Math.random() * locations.length)],
    condition: conditions[Math.floor(Math.random() * conditions.length)]
  }));
};

// Generate room availability for the next 14 days
const generateRoomAvailability = (roomId: string) => {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, dayIndex) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayIndex);
    
    // Generate time slots from 8:00 AM to 8:00 PM in 1-hour increments
    const slots = Array.from({ length: 12 }).map((_, hourIndex) => {
      const startHour = 8 + hourIndex;
      const endHour = startHour + 1;
      
      return {
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        isAvailable: Math.random() > 0.3 // 70% chance of being available
      };
    });
    
    return {
      date: date.toISOString().split('T')[0],
      slots
    };
  });
};

export const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
    pageCount: 208,
    publicationYear: 1925,
    publisher: 'Scribner',
    genres: ['Classic', 'Fiction', 'Literary Fiction'],
    isbn: '9780743273565',
    language: 'English',
    copies: generateBookCopies('book-1', 5),
    addedDate: '2023-01-15',
    rating: 4.5
  },
  {
    id: 'book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: 'https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg',
    description: 'To Kill a Mockingbird is a novel by the American author Harper Lee. It was published in 1960 and was instantly successful. In the United States, it is widely read in high schools and middle schools.',
    pageCount: 324,
    publicationYear: 1960,
    publisher: 'J.B. Lippincott & Co.',
    genres: ['Classic', 'Fiction', 'Historical Fiction'],
    isbn: '9780061120084',
    language: 'English',
    copies: generateBookCopies('book-2', 3),
    addedDate: '2023-01-10',
    rating: 4.8
  },
  {
    id: 'book-3',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverImage: 'https://m.media-amazon.com/images/I/91vw43HLQuL._AC_UF1000,1000_QL80_.jpg',
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission and if he fails, humanity and the Earth itself will perish. Except that right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment or how to complete it.",
    pageCount: 496,
    publicationYear: 2021,
    publisher: 'Ballantine Books',
    genres: ['Science Fiction', 'Space Exploration', 'Thriller'],
    isbn: '9780593135204',
    language: 'English',
    copies: generateBookCopies('book-3', 6),
    addedDate: '2023-06-20',
    rating: 4.7
  },
  {
    id: 'book-4',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    coverImage: 'https://m.media-amazon.com/images/I/71PL7BiZ6cL._AC_UF1000,1000_QL80_.jpg',
    description: 'From her place in the store, Klara, an Artificial Friend with outstanding observational qualities, watches carefully the behavior of those who come in to browse, and of those who pass on the street outside. She remains hopeful that a customer will soon choose her, but when the possibility emerges that her circumstances may change forever, Klara is warned not to invest too much in the promises of humans.',
    pageCount: 303,
    publicationYear: 2021,
    publisher: 'Alfred A. Knopf',
    genres: ['Science Fiction', 'Dystopian', 'Literary Fiction'],
    isbn: '9780571364879',
    language: 'English',
    copies: generateBookCopies('book-4', 4),
    addedDate: '2023-05-15',
    rating: 4.2
  },
  {
    id: 'book-5',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverImage: 'https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?',
    pageCount: 304,
    publicationYear: 2020,
    publisher: 'Viking',
    genres: ['Fiction', 'Fantasy', 'Contemporary'],
    isbn: '9780525559474',
    language: 'English',
    copies: generateBookCopies('book-5', 7),
    addedDate: '2023-02-28',
    rating: 4.3
  },
  {
    id: 'book-6',
    title: 'Educated',
    author: 'Tara Westover',
    coverImage: 'https://m.media-amazon.com/images/I/71yNgTMEcpL._AC_UF1000,1000_QL80_.jpg',
    description: 'Tara Westover was 17 the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches and sleeping with her "head-for-the-hills bag". The family was so isolated from mainstream society that there was no one to ensure the children received an education.',
    pageCount: 334,
    publicationYear: 2018,
    publisher: 'Random House',
    genres: ['Memoir', 'Biography', 'Nonfiction'],
    isbn: '9780399590504',
    language: 'English',
    copies: generateBookCopies('book-6', 3),
    addedDate: '2023-03-10',
    rating: 4.6
  }
];

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Grand Reading Room',
    description: 'A spacious, quiet reading room with large windows and comfortable seating for individual study or reading.',
    capacity: 30,
    location: 'Main Floor - East Wing',
    amenities: ['wifi', 'silence'] as RoomAmenity[],
    images: [
      'https://images.pexels.com/photos/2041556/pexels-photo-2041556.jpeg',
      'https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'
    ],
    availabilitySchedule: generateRoomAvailability('room-1'),
    floorMapPosition: { x: 120, y: 80 }
  },
  {
    id: 'room-2',
    name: 'Technology Lab',
    description: 'Modern computer lab equipped with high-performance desktops, software, and multimedia capabilities.',
    capacity: 15,
    location: 'Second Floor - North Wing',
    amenities: ['wifi', 'computers', 'printer'] as RoomAmenity[],
    images: [
      'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg',
      'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg'
    ],
    availabilitySchedule: generateRoomAvailability('room-2'),
    floorMapPosition: { x: 240, y: 130 }
  },
  {
    id: 'room-3',
    name: 'Collaboration Studio',
    description: 'Designed for group projects and collaborative work with modular furniture and whiteboard walls.',
    capacity: 12,
    location: 'Main Floor - West Wing',
    amenities: ['wifi', 'whiteboard', 'videoconferencing'] as RoomAmenity[],
    images: [
      'https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg',
      'https://images.pexels.com/photos/7097/people-coffee-tea-meeting.jpg'
    ],
    availabilitySchedule: generateRoomAvailability('room-3'),
    floorMapPosition: { x: 80, y: 200 }
  },
  {
    id: 'room-4',
    name: 'Presentation Room',
    description: 'Equipped for presentations and workshops with a high-quality projector and sound system.',
    capacity: 25,
    location: 'Second Floor - South Wing',
    amenities: ['wifi', 'projector', 'videoconferencing'] as RoomAmenity[],
    images: [
      'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg',
      'https://images.pexels.com/photos/159805/meeting-modern-room-conference-159805.jpeg'
    ],
    availabilitySchedule: generateRoomAvailability('room-4'),
    floorMapPosition: { x: 200, y: 250 }
  },
  {
    id: 'room-5',
    name: 'Study Pods',
    description: 'Individual study pods for focused, distraction-free work or study sessions.',
    capacity: 8,
    location: 'Third Floor',
    amenities: ['wifi', 'silence', 'study-pods'] as RoomAmenity[],
    images: [
      'https://images.pexels.com/photos/833052/pexels-photo-833052.jpeg',
      'https://images.pexels.com/photos/373488/pexels-photo-373488.jpeg'
    ],
    availabilitySchedule: generateRoomAvailability('room-5'),
    floorMapPosition: { x: 150, y: 350 }
  }
];

export const getBookById = (id: string): Book | undefined => {
  return mockBooks.find(book => book.id === id);
};

export const getRoomById = (id: string): Room | undefined => {
  return mockRooms.find(room => room.id === id);
};

export const getAvailableBookCopiesCount = (bookId: string): number => {
  const book = getBookById(bookId);
  if (!book) return 0;
  return book.copies.filter(copy => copy.status === 'available').length;
};

export const searchBooks = (
  query: string,
  filters: {
    genres?: string[];
    availability?: BookStatus;
    sortBy?: 'title' | 'author' | 'publicationYear' | 'addedDate';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Book[] => {
  let results = [...mockBooks];
  
  // Search by query
  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    results = results.filter(
      book => 
        book.title.toLowerCase().includes(lowerCaseQuery) ||
        book.author.toLowerCase().includes(lowerCaseQuery) ||
        book.isbn.includes(query) ||
        book.description.toLowerCase().includes(lowerCaseQuery) ||
        book.genres.some(genre => genre.toLowerCase().includes(lowerCaseQuery))
    );
  }
  
  // Filter by genres
  if (filters.genres && filters.genres.length > 0) {
    results = results.filter(book => 
      filters.genres!.some(genre => book.genres.includes(genre))
    );
  }
  
  // Filter by availability
  if (filters.availability) {
    results = results.filter(book => 
      book.copies.some(copy => copy.status === filters.availability)
    );
  }
  
  // Sort results
  if (filters.sortBy) {
    results.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (filters.sortBy) {
        case 'title':
          valueA = a.title;
          valueB = b.title;
          break;
        case 'author':
          valueA = a.author;
          valueB = b.author;
          break;
        case 'publicationYear':
          valueA = a.publicationYear;
          valueB = b.publicationYear;
          break;
        case 'addedDate':
          valueA = new Date(a.addedDate).getTime();
          valueB = new Date(b.addedDate).getTime();
          break;
        default:
          valueA = a.title;
          valueB = b.title;
      }
      
      if (filters.sortOrder === 'desc') {
        return valueA > valueB ? -1 : 1;
      } else {
        return valueA < valueB ? -1 : 1;
      }
    });
  }
  
  return results;
};

export const getAllGenres = (): string[] => {
  const genresSet = new Set<string>();
  mockBooks.forEach(book => {
    book.genres.forEach(genre => genresSet.add(genre));
  });
  return Array.from(genresSet).sort();
};

export const searchRooms = (
  query: string,
  filters: {
    capacity?: number;
    amenities?: RoomAmenity[];
    date?: string;
  } = {}
): Room[] => {
  let results = [...mockRooms];
  
  // Search by query
  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    results = results.filter(
      room => 
        room.name.toLowerCase().includes(lowerCaseQuery) ||
        room.description.toLowerCase().includes(lowerCaseQuery) ||
        room.location.toLowerCase().includes(lowerCaseQuery)
    );
  }
  
  // Filter by capacity
  if (filters.capacity) {
    results = results.filter(room => room.capacity >= filters.capacity);
  }
  
  // Filter by amenities
  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter(room => 
      filters.amenities!.every(amenity => room.amenities.includes(amenity))
    );
  }
  
  // Filter by date availability
  if (filters.date) {
    results = results.filter(room => {
      const availabilityForDate = room.availabilitySchedule.find(
        schedule => schedule.date === filters.date
      );
      return availabilityForDate && availabilityForDate.slots.some(slot => slot.isAvailable);
    });
  }
  
  return results;
};

export const getAllAmenities = (): RoomAmenity[] => {
  const amenitiesSet = new Set<RoomAmenity>();
  mockRooms.forEach(room => {
    room.amenities.forEach(amenity => amenitiesSet.add(amenity));
  });
  return Array.from(amenitiesSet).sort() as RoomAmenity[];
};
