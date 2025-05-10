
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

// Empty mock activities - would need a new service
export const mockActivities: Activity[] = [];

// Re-export functionalities with async implementations
export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  return await ReservationService.getUserReservations(userId);
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  return await NotificationService.getUserNotifications(userId);
};

// Statistics function - would need to be implemented with real data
export const getStatistics = async () => {
  // In a real implementation, this would fetch from the database
  try {
    const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
    const { count: roomsCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true });
    const { count: activeReservationsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("Completed","Declined")');
    const { count: availableBooksCount } = await supabase
      .from('book_copies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');
    const { count: pendingApprovalsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending');
    const { count: overdueItemsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Approved')
      .lt('end_date', new Date().toISOString());

    return {
      totalBooks: booksCount || 0,
      totalRooms: roomsCount || 0,
      activeReservations: activeReservationsCount || 0,
      availableBooks: availableBooksCount || 0,
      pendingApprovals: pendingApprovalsCount || 0,
      overdueItems: overdueItemsCount || 0
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      totalBooks: 0,
      totalRooms: 0,
      activeReservations: 0,
      availableBooks: 0,
      pendingApprovals: 0,
      overdueItems: 0
    };
  }
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
