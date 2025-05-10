
// This file now re-exports methods from our service files
// but provides compatibility with existing code

import { User, Book, Room, Reservation, Notification, Activity } from '../types/models';
import * as UserService from '../services/userService';
import * as BookService from '../services/bookService';
import * as RoomService from '../services/roomService';
import * as ReservationService from '../services/reservationService';
import * as NotificationService from '../services/notificationService';
import { supabase } from '../integrations/supabase/client';

// Empty arrays for backward compatibility
export const mockUsers: User[] = [];
export const mockBooks: Book[] = [];
export const mockRooms: Room[] = [];
export const mockReservations: Reservation[] = [];
export const mockNotifications: Notification[] = [];
export const mockPendingReservations: Reservation[] = [];

// Mock activities - would need a new service
export const mockActivities: Activity[] = [
  {
    id: '1',
    userId: 'user1',
    action: 'reservation',
    description: 'reserved "The Great Gatsby"',
    timestamp: '2023-05-09T14:30:00Z',
    itemId: 'book1',
    itemType: 'book',
    // Added for compatibility with ActivityFeed component
    type: 'reservation',
    user: 'John Doe',
    details: 'reserved "The Great Gatsby"',
    date: '2023-05-09T14:30:00Z'
  },
  {
    id: '2',
    userId: 'user2',
    action: 'return',
    description: 'returned "To Kill a Mockingbird"',
    timestamp: '2023-05-08T11:20:00Z',
    itemId: 'book2',
    itemType: 'book',
    // Added for compatibility
    type: 'return',
    user: 'Jane Smith',
    details: 'returned "To Kill a Mockingbird"',
    date: '2023-05-08T11:20:00Z'
  },
  {
    id: '3',
    userId: 'user3',
    action: 'new_member',
    description: 'joined the library',
    timestamp: '2023-05-07T09:15:00Z',
    // Added for compatibility
    type: 'new_member',
    user: 'Alex Johnson',
    details: 'joined the library',
    date: '2023-05-07T09:15:00Z'
  }
];

// Export the types for compatibility
export type { User, Book, Room, Reservation, Notification, Activity };

// Re-export functionalities with sync wrappers for backward compatibility
export const getUserReservations = (userId: string): Reservation[] => {
  // Return empty array for backward compatibility - async version should be used directly
  return [];
};

export const getUserNotifications = (userId: string): Notification[] => {
  // Return empty array for backward compatibility - async version should be used directly
  return [];
};

// Statistics function - would need to be implemented with real data
export const getStatistics = () => {
  // In a real implementation, this would fetch from the database
  // For now, return placeholder values for backward compatibility
  return {
    totalBooks: 100,
    totalRooms: 10,
    activeReservations: 25,
    availableBooks: 75,
    pendingApprovals: 5,
    overdueItems: 3
  };
};

// Mock login replaced with real authentication
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !data.user) {
      console.error("Login error:", error);
      return null;
    }
    
    return await UserService.getUserById(data.user.id);
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
};
