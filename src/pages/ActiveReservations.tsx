import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ReservationCard } from '../components/ReservationCard';
import { Reservation } from '../types/models';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Book, Calendar, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BookCompletionModal from '../components/BookCompletionModal';
import { useToast } from '@/components/ui/use-toast';

const ActiveReservations: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'book' | 'room'>('all');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<{id: string, bookId: string, title: string} | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Log the user ID for debugging
        console.log('Fetching reservations for user ID:', user.id);
        
        // Execute the query with proper field names and conditions
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('user_id', user.id) // Use snake_case for database field names
          .eq('status', 'Approved')
          .gte('end_date', new Date().toISOString()) // Use snake_case for end_date
          .order('start_date', { ascending: true }); // Use snake_case for start_date
          
        // Log the query results for debugging
        console.log('Query result:', { data, error });
        
        // Apply type filter on the client side if needed
        let filteredData = data || [];
        if (filterType !== 'all' && filteredData.length > 0) {
          filteredData = filteredData.filter(item => item.item_type === filterType);
        }
        
        if (error) throw error;
        
        // Convert to Reservation type
        const typedReservations = filteredData.map(item => ({
          id: item.id,
          userId: item.user_id,
          itemId: item.item_id,
          itemType: item.item_type,
          title: item.title,
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.status,
          notes: item.notes,
          createdAt: item.created_at
        })) as Reservation[];
        
        setReservations(typedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
    
    // Set up real-time subscription for reservation updates
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations', filter: `userId=eq.${user?.id}` },
        () => fetchReservations()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, filterType]);
  
  // Filter reservations based on search query
  const filteredReservations = reservations.filter(reservation => 
    reservation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompleteReservation = (reservation: Reservation) => {
    // Only show completion modal for books, not rooms
    if (reservation.itemType === 'book') {
      setSelectedReservation({
        id: reservation.id,
        bookId: reservation.itemId,
        title: reservation.title
      });
      setShowCompletionModal(true);
    } else {
      // For rooms, just mark as completed directly
      completeReservation(reservation.id);
    }
  };

  const completeReservation = async (reservationId: string) => {
    try {
      console.log('Completing room reservation:', reservationId);
      
      // STEP 1: Get the room ID associated with this reservation
      const { data: reservationData, error: fetchError } = await supabase
        .from('reservations')
        .select('item_id, title')
        .eq('id', reservationId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching reservation details:', fetchError);
        toast({
          title: 'Error',
          description: 'Could not find reservation details',
          variant: 'destructive'
        });
        return;
      }
      
      const roomId = reservationData.item_id;
      const roomTitle = reservationData.title;
      console.log(`Processing return for room: ${roomTitle} (ID: ${roomId})`);
      
      // STEP 2: Delete the reservation completely (ensure it belongs to this user)
      console.log('Deleting room reservation with ID:', reservationId);
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .match({ id: reservationId, user_id: user.id });
      
      if (deleteError) {
        console.error('Error deleting reservation:', deleteError);
        toast({
          title: 'Error',
          description: 'Failed to delete reservation',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Reservation deleted successfully');
      
      // STEP 3: Update room availability - simplified to just today
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's availability record
      const { data: availabilityData, error: availabilityFetchError } = await supabase
        .from('room_availability')
        .select('id, slots')
        .eq('room_id', roomId)
        .eq('date', today)
        .single();
      
      if (!availabilityFetchError && availabilityData) {
        // Parse the slots
        const slots = typeof availabilityData.slots === 'string' 
          ? JSON.parse(availabilityData.slots) 
          : availabilityData.slots;
        
        // Mark all slots as available
        const updatedSlots = slots.map((slot: any) => ({
          ...slot,
          isAvailable: true
        }));
        
        // Update the availability
        const { error: updateError } = await supabase
          .from('room_availability')
          .update({ slots: JSON.stringify(updatedSlots) })
          .eq('id', availabilityData.id);
        
        if (updateError) {
          console.error('Error updating room availability:', updateError);
        } else {
          console.log('Room availability updated successfully');
        }
      }
      
      // Success message
      toast({
        title: 'Success',
        description: `Room '${roomTitle}' has been returned successfully`
      });
      
      // Refresh the reservations list
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (error) {
      console.error('Error completing reservation:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout 
      title="Active Reservations" 
      breadcrumbs={[
        { label: 'Dashboard', path: '/' },
        { label: 'Active Reservations' }
      ]}
    >
      <div className="space-y-6">
        {/* Book Completion Modal for data collection */}
        {selectedReservation && (
          <BookCompletionModal
            isOpen={showCompletionModal}
            onClose={() => {
              setShowCompletionModal(false);
              setSelectedReservation(null);
            }}
            onComplete={(reservationId) => {
              console.log('Book return completed, updating UI');
              // Update the UI immediately by removing the completed reservation
              setReservations(prevReservations => {
                const updatedReservations = prevReservations.filter(r => r.id !== reservationId);
                console.log(`Removed reservation ${reservationId}, ${prevReservations.length} -> ${updatedReservations.length} reservations`);
                return updatedReservations;
              });
            }}
            reservationId={selectedReservation.id}
            bookId={selectedReservation.bookId}
            bookTitle={selectedReservation.title}
          />
        )}
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={(value: 'all' | 'book' | 'room') => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>{filterType === 'all' ? 'All Types' : filterType === 'book' ? 'Books Only' : 'Rooms Only'}</span>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="book">Books Only</SelectItem>
                <SelectItem value="room">Rooms Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Reservations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReservations.map(reservation => (
                <ReservationCard 
                  key={reservation.id} 
                  reservation={reservation} 
                  compact={false}
                  onComplete={handleCompleteReservation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              {filterType === 'book' ? (
                <Book className="mx-auto h-12 w-12 text-muted-foreground/40" />
              ) : filterType === 'room' ? (
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
              ) : (
                <div className="flex justify-center gap-4">
                  <Book className="h-12 w-12 text-muted-foreground/40" />
                  <Calendar className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <h3 className="mt-4 text-xl font-medium">No active reservations found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery ? 
                  `No results match "${searchQuery}"` : 
                  'You don\'t have any active reservations at the moment'}
              </p>
              <div className="mt-6">
                <Button className="mr-2" asChild>
                  <a href="/catalog">Browse Books</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/rooms">Reserve a Room</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActiveReservations;
