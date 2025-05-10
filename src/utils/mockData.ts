
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
export const mockActivities: Activity[] = [];

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
