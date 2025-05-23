
import { supabase } from '../integrations/supabase/client';
import { Reservation, ReservationType, ReservationStatus } from '../types/models';

export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user reservations:", error);
    return [];
  }

  return data.map(reservation => ({
    id: reservation.id,
    userId: reservation.user_id,
    itemId: reservation.item_id,
    itemType: reservation.item_type,
    title: reservation.title,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    status: reservation.status,
    notes: reservation.notes,
    createdAt: reservation.created_at
  }));
};

export const createReservation = async (reservation: {
  userId: string;
  itemId: string;
  itemType: ReservationType;
  title: string;
  startDate: string;
  endDate: string;
  notes?: string;
}): Promise<Reservation | null> => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        user_id: reservation.userId,
        item_id: reservation.itemId,
        item_type: reservation.itemType,
        title: reservation.title,
        start_date: reservation.startDate,
        end_date: reservation.endDate,
        status: 'Pending',
        notes: reservation.notes
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating reservation:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    itemId: data.item_id,
    itemType: data.item_type,
    title: data.title,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at
  };
};

export const updateReservationStatus = async (
  reservationId: string,
  status: ReservationStatus
): Promise<boolean> => {
  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', reservationId);

  if (error) {
    console.error(`Error updating reservation ${reservationId} status:`, error);
    return false;
  }

  return true;
};

export const getPendingReservations = async (): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at');

  if (error) {
    console.error("Error fetching pending reservations:", error);
    return [];
  }

  return data.map(reservation => ({
    id: reservation.id,
    userId: reservation.user_id,
    itemId: reservation.item_id,
    itemType: reservation.item_type,
    title: reservation.title,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    status: reservation.status,
    notes: reservation.notes,
    createdAt: reservation.created_at
  }));
};
