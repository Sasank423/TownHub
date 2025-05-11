import React, { useState, useEffect } from 'react';
import { CheckCircle, Book, Home, Clock, X, Search, Filter, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getPendingBookRequests, 
  updateReservationStatus,
  subscribeToTable, 
  unsubscribe 
} from '../utils/supabaseRealtime';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ReservationStatus } from '../types/models';

// Define interfaces for the activity and reservation data
interface FormattedReservation {
  id: string;
  activityId: string;
  userId: string;
  title: string;
  itemType: string;
  startDate: string;
  endDate: string;
  userName: string;
  status: ReservationStatus;
}

export const ApprovalQueue: React.FC = () => {
  const [pendingReservations, setPendingReservations] = useState<FormattedReservation[]>([]);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch pending reservations and set up real-time listeners
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadPendingRequests = async () => {
      try {
        setLoading(true);
        // Get pending book requests
        const requests = await getPendingBookRequests();
        console.log("Pending requests:", requests);
        
        const formattedRequests: FormattedReservation[] = requests.map(req => ({
          id: req.reservations?.id || '',
          activityId: req.id,
          userId: req.user_id,
          title: req.reservations?.title || req.description,
          itemType: req.item_type || 'book',
          startDate: req.reservations?.start_date || new Date().toISOString(),
          endDate: req.reservations?.end_date || '',
          userName: req.user_name || `User #${req.user_id}`,
          status: req.reservations?.status || 'Pending'
        }));
        
        setPendingReservations(formattedRequests);
      } catch (error) {
        console.error("Error loading pending requests:", error);
        toast({
          title: "Error",
          description: "Failed to load pending requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadPendingRequests();

    // Set up real-time subscription for activities
    const setupChannel = async () => {
      channel = await subscribeToTable('activities', 'INSERT', (payload) => {
        console.log("New activity:", payload);
        if (payload.new && payload.new.action === 'reservation' && !payload.new.is_processed) {
          loadPendingRequests();
        }
      });
    };
    
    setupChannel();

    // Cleanup
    return () => {
      if (channel) unsubscribe(channel);
    };
  }, [toast]);

  const handleApprove = async (id: string, activityId: string) => {
    try {
      const success = await updateReservationStatus(id, 'Approved', activityId);
      if (success) {
        setPendingReservations(prev => prev.filter(res => res.id !== id));
        toast({
          title: "Reservation approved",
          description: "The reservation has been approved successfully.",
        });
      } else {
        throw new Error("Failed to update reservation");
      }
    } catch (error) {
      console.error("Error approving reservation:", error);
      toast({
        title: "Error",
        description: "Failed to approve the reservation",
        variant: "destructive",
      });
    }
  };
  
  const handleDecline = async (id: string, activityId: string) => {
    try {
      const success = await updateReservationStatus(id, 'Declined', activityId);
      if (success) {
        setPendingReservations(prev => prev.filter(res => res.id !== id));
        toast({
          title: "Reservation declined",
          description: "The reservation has been declined.",
          variant: "destructive",
        });
      } else {
        throw new Error("Failed to update reservation");
      }
    } catch (error) {
      console.error("Error declining reservation:", error);
      toast({
        title: "Error",
        description: "Failed to decline the reservation",
        variant: "destructive",
      });
    }
  };

  const handleBatchApprove = async () => {
    if (selectedReservations.length === 0) return;
    
    try {
      // Find the selected reservations with their activity IDs
      const toApprove = pendingReservations.filter(res => selectedReservations.includes(res.id));
      
      // Process each reservation
      for (const res of toApprove) {
        await updateReservationStatus(res.id, 'Approved', res.activityId);
      }
      
      setPendingReservations(prev => 
        prev.filter(res => !selectedReservations.includes(res.id))
      );
      
      toast({
        title: `${selectedReservations.length} reservations approved`,
        description: "The selected reservations have been approved successfully.",
      });
      
      setSelectedReservations([]);
    } catch (error) {
      console.error("Error in batch approval:", error);
      toast({
        title: "Error",
        description: "Failed to process some approvals",
        variant: "destructive",
      });
    }
  };

  const handleBatchDecline = async () => {
    if (selectedReservations.length === 0) return;
    
    try {
      // Find the selected reservations with their activity IDs
      const toDecline = pendingReservations.filter(res => selectedReservations.includes(res.id));
      
      // Process each reservation
      for (const res of toDecline) {
        await updateReservationStatus(res.id, 'Declined', res.activityId);
      }
      
      setPendingReservations(prev => 
        prev.filter(res => !selectedReservations.includes(res.id))
      );
      
      toast({
        title: `${selectedReservations.length} reservations declined`,
        description: "The selected reservations have been declined.",
        variant: "destructive",
      });
      
      setSelectedReservations([]);
    } catch (error) {
      console.error("Error in batch decline:", error);
      toast({
        title: "Error",
        description: "Failed to process some declines",
        variant: "destructive",
      });
    }
  };

  const handleSelectReservation = (id: string) => {
    setSelectedReservations(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedReservations.length === filteredReservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(filteredReservations.map(res => res.id));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      if (dateString.includes('T')) {
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }).format(date);
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  // Filter reservations based on search, type and date
  const filteredReservations = pendingReservations.filter(res => {
    const matchesSearch = res.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filtering
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(res.startDate);
      startDate.setHours(0, 0, 0, 0);
      return matchesSearch && startDate.getTime() === today.getTime();
    } else if (dateFilter === 'this-week') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      const startDate = new Date(res.startDate);
      return matchesSearch && startDate >= startOfWeek && startDate <= endOfWeek;
    }
    
    return matchesSearch;
  });
  
  const bookReservations = filteredReservations.filter(res => res.itemType === 'book');
  const roomReservations = filteredReservations.filter(res => res.itemType === 'room');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center dark:text-white">
          <CheckCircle className="mr-2 h-5 w-5 text-primary" />
          Pending Approvals
        </h2>
        {pendingReservations.length > 0 && (
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {pendingReservations.length} pending
          </span>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search reservations..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch actions */}
      {selectedReservations.length > 0 && (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-md mb-4">
          <div>
            <span className="text-sm font-medium dark:text-white">
              {selectedReservations.length} items selected
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBatchDecline}
              className="text-red-500 hover:text-red-700 hover:border-red-200"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleBatchApprove}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : pendingReservations.length === 0 ? (
        <div className="text-center py-10">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No pending approvals at the moment.</p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All 
              <Badge variant="outline" className="ml-2 bg-gray-100 dark:bg-gray-800">
                {filteredReservations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="books">
              Books
              <Badge variant="outline" className="ml-2 bg-gray-100 dark:bg-gray-800">
                {bookReservations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rooms">
              Rooms
              <Badge variant="outline" className="ml-2 bg-gray-100 dark:bg-gray-800">
                {roomReservations.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ReservationList 
              reservations={filteredReservations}
              selectedReservations={selectedReservations}
              onSelectReservation={handleSelectReservation}
              onApprove={handleApprove}
              onDecline={handleDecline}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="books">
            <ReservationList 
              reservations={bookReservations}
              selectedReservations={selectedReservations}
              onSelectReservation={handleSelectReservation}
              onApprove={handleApprove}
              onDecline={handleDecline}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="rooms">
            <ReservationList 
              reservations={roomReservations}
              selectedReservations={selectedReservations}
              onSelectReservation={handleSelectReservation}
              onApprove={handleApprove}
              onDecline={handleDecline}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      )}

      {filteredReservations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedReservations.length === filteredReservations.length && filteredReservations.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
            />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Select all
            </label>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredReservations.length} of {pendingReservations.length} reservations
          </div>
        </div>
      )}
    </div>
  );
};

interface ReservationListProps {
  reservations: FormattedReservation[];
  selectedReservations: string[];
  onSelectReservation: (id: string) => void;
  onApprove: (id: string, activityId: string) => void;
  onDecline: (id: string, activityId: string) => void;
  formatDate: (date: string) => string;
}

const ReservationList: React.FC<ReservationListProps> = ({ 
  reservations,
  selectedReservations,
  onSelectReservation,
  onApprove,
  onDecline,
  formatDate
}) => {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No matching reservations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map(reservation => (
        <div 
          key={reservation.id} 
          className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <input
                type="checkbox"
                checked={selectedReservations.includes(reservation.id)}
                onChange={() => onSelectReservation(reservation.id)}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
              />
            </div>
            <div className="flex-1 flex justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${reservation.itemType === 'book' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                  {reservation.itemType === 'book' ? (
                    <Book className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  ) : (
                    <Home className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium dark:text-white">{reservation.title}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {formatDate(reservation.startDate)}
                      {reservation.itemType === 'book' && reservation.endDate && ` - ${formatDate(reservation.endDate)}`}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <Badge variant="outline" className={reservation.itemType === 'book' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"}>
                      {reservation.itemType === 'book' ? "Book" : "Room"}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      Requested by <span className="font-medium text-gray-700 dark:text-gray-300">{reservation.userName || `User #${reservation.userId}`}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onDecline(reservation.id, reservation.activityId)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full transition-colors"
                  aria-label="Decline"
                >
                  <X className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onApprove(reservation.id, reservation.activityId)}
                  className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-full transition-colors"
                  aria-label="Approve"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
