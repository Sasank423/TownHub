
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'librarian';
  membershipStatus: 'Active' | 'Pending' | 'Expired';
  joinDate: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  status: 'Available' | 'Reserved' | 'Checked Out';
  dueDate?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  status: 'Available' | 'Reserved';
}

export interface Reservation {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'book' | 'room';
  status: 'Pending' | 'Approved' | 'Declined' | 'Completed';
  startDate: string;
  endDate: string;
  title: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'approval' | 'pickup' | 'due' | 'system';
  message: string;
  date: string;
  read: boolean;
}

export interface Activity {
  id: string;
  type: 'reservation' | 'return' | 'approval' | 'new_item' | 'new_member';
  user: string;
  details: string;
  date: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'member',
    membershipStatus: 'Active',
    joinDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'librarian',
    membershipStatus: 'Active',
    joinDate: '2023-05-20',
  },
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format',
    status: 'Available',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=200&auto=format',
    status: 'Reserved',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format',
    status: 'Checked Out',
    dueDate: '2025-06-01',
  },
];

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Study Room A',
    capacity: 4,
    features: ['Whiteboard', 'Power Outlets', 'Wi-Fi'],
    status: 'Available',
  },
  {
    id: '2',
    name: 'Conference Room B',
    capacity: 10,
    features: ['Projector', 'Video Conferencing', 'Whiteboard'],
    status: 'Reserved',
  },
];

export const mockReservations: Reservation[] = [
  {
    id: '1',
    userId: '1',
    itemId: '3',
    itemType: 'book',
    status: 'Approved',
    startDate: '2025-05-15',
    endDate: '2025-06-01',
    title: '1984',
  },
  {
    id: '2',
    userId: '1',
    itemId: '2',
    itemType: 'room',
    status: 'Approved',
    startDate: '2025-05-12T14:00',
    endDate: '2025-05-12T16:00',
    title: 'Conference Room B',
  },
  {
    id: '3',
    userId: '1',
    itemId: '2',
    itemType: 'book',
    status: 'Pending',
    startDate: '2025-05-18',
    endDate: '2025-06-08',
    title: 'To Kill a Mockingbird',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'approval',
    message: 'Your reservation for "To Kill a Mockingbird" is pending approval.',
    date: '2025-05-10T10:30',
    read: false,
  },
  {
    id: '2',
    userId: '1',
    type: 'pickup',
    message: 'Your book "1984" is ready for pickup.',
    date: '2025-05-13T14:15',
    read: true,
  },
  {
    id: '3',
    userId: '1',
    type: 'due',
    message: '"1984" is due in 3 days.',
    date: '2025-05-29T09:00',
    read: false,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'reservation',
    user: 'John Doe',
    details: 'Reserved "The Great Gatsby"',
    date: '2025-05-10T11:30',
  },
  {
    id: '2',
    type: 'approval',
    user: 'Jane Smith',
    details: 'Approved reservation for "1984"',
    date: '2025-05-10T12:15',
  },
  {
    id: '3',
    type: 'new_member',
    user: 'Admin',
    details: 'New member Sarah Johnson joined',
    date: '2025-05-09T15:45',
  },
  {
    id: '4',
    type: 'new_item',
    user: 'Jane Smith',
    details: 'Added 3 new books to the catalog',
    date: '2025-05-09T10:30',
  },
  {
    id: '5',
    type: 'return',
    user: 'Michael Brown',
    details: 'Returned "Pride and Prejudice"',
    date: '2025-05-08T16:20',
  },
];

export const mockPendingReservations: Reservation[] = [
  {
    id: '3',
    userId: '1',
    itemId: '2',
    itemType: 'book',
    status: 'Pending',
    startDate: '2025-05-18',
    endDate: '2025-06-08',
    title: 'To Kill a Mockingbird',
  },
  {
    id: '4',
    userId: '3',
    itemId: '1',
    itemType: 'room',
    status: 'Pending',
    startDate: '2025-05-20T10:00',
    endDate: '2025-05-20T12:00',
    title: 'Study Room A',
  },
];

export const getStatistics = () => {
  return {
    totalBooks: 1243,
    totalRooms: 12,
    activeReservations: 57,
    availableBooks: 876,
    pendingApprovals: 8,
    overdueItems: 5
  };
};

export const login = (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user && password === 'password') {
        resolve(user);
      } else {
        resolve(null);
      }
    }, 800);
  });
};

export const getUserReservations = (userId: string): Reservation[] => {
  return mockReservations.filter(res => res.userId === userId);
};

export const getUserNotifications = (userId: string): Notification[] => {
  return mockNotifications.filter(notif => notif.userId === userId);
};
