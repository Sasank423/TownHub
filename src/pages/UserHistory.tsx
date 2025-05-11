import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Search, Filter, RefreshCw, BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface UserActivity {
  id: string;
  action: string;
  description: string;
  item_id: string;
  item_type: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  is_processed: boolean;
}

interface Reservation {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  notes?: string;
  title?: string;
  author?: string;
  room_name?: string;
}

const UserHistory = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('activities');

  // Fetch user's activity history
  useEffect(() => {
    if (!user) return;

    const fetchUserHistory = async () => {
      setLoading(true);
      try {
        // Fetch user activities
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (activityError) throw activityError;

        // Fetch user reservations
        const { data: reservationData, error: reservationError } = await supabase
          .from('reservations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reservationError) throw reservationError;

        // Process reservation data and fetch additional details
        const processedReservations = await Promise.all((reservationData || []).map(async (res) => {
          let title, author, room_name;
          
          // Fetch book or room details based on item_type
          if (res.item_type === 'book') {
            const { data: bookData } = await supabase
              .from('books')
              .select('title, author')
              .eq('id', res.item_id)
              .single();
              
            if (bookData) {
              title = bookData.title;
              author = bookData.author;
            }
          } else if (res.item_type === 'room') {
            const { data: roomData } = await supabase
              .from('rooms')
              .select('name')
              .eq('id', res.item_id)
              .single();
              
            if (roomData) {
              room_name = roomData.name;
            }
          }
          
          const reservation: Reservation = {
            id: res.id,
            user_id: res.user_id,
            item_id: res.item_id,
            item_type: res.item_type,
            status: res.status,
            start_date: res.start_date,
            end_date: res.end_date,
            created_at: res.created_at,
            notes: res.notes,
            title,
            author,
            room_name
          };
          return reservation;
        }));

        if (activityData) {
          setActivities(activityData as UserActivity[]);
          setFilteredActivities(activityData as UserActivity[]);
        }

        if (processedReservations) {
          setReservations(processedReservations);
        }
      } catch (error) {
        console.error('Error fetching user history:', error);
        toast.error('Failed to fetch your history');
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [user]);

  // Filter activities based on search query and filters
  useEffect(() => {
    let result = activities;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        activity =>
          activity.description.toLowerCase().includes(query) ||
          activity.action.toLowerCase().includes(query)
      );
    }

    // Apply action filter
    if (actionFilter !== 'all') {
      result = result.filter(activity => activity.action === actionFilter);
    }

    setFilteredActivities(result);
  }, [activities, searchQuery, actionFilter]);

  // Get unique action types for filter
  const actionTypes = ['all', ...new Set(activities.map(activity => activity.action))];

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return timestamp;
    }
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      return `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };

  // Get badge color based on action
  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'checkout':
        return 'bg-blue-500';
      case 'return':
        return 'bg-green-500';
      case 'reserve':
        return 'bg-purple-500';
      case 'cancel':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Refresh history
  const handleRefresh = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user activities
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (activityError) throw activityError;

      // Fetch user reservations
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reservationError) throw reservationError;

      // Process reservation data and fetch additional details
      const processedReservations = await Promise.all((reservationData || []).map(async (res) => {
        let title, author, room_name;
        
        // Fetch book or room details based on item_type
        if (res.item_type === 'book') {
          const { data: bookData } = await supabase
            .from('books')
            .select('title, author')
            .eq('id', res.item_id)
            .single();
            
          if (bookData) {
            title = bookData.title;
            author = bookData.author;
          }
        } else if (res.item_type === 'room') {
          const { data: roomData } = await supabase
            .from('rooms')
            .select('name')
            .eq('id', res.item_id)
            .single();
            
          if (roomData) {
            room_name = roomData.name;
          }
        }
        
        const reservation: Reservation = {
          id: res.id,
          user_id: res.user_id,
          item_id: res.item_id,
          item_type: res.item_type,
          status: res.status,
          start_date: res.start_date,
          end_date: res.end_date,
          created_at: res.created_at,
          notes: res.notes,
          title,
          author,
          room_name
        };
        return reservation;
      }));

      if (activityData) {
        setActivities(activityData as UserActivity[]);
        setFilteredActivities(activityData as UserActivity[]);
      }

      if (processedReservations) {
        setReservations(processedReservations);
      }

      toast.success('History refreshed');
    } catch (error) {
      console.error('Error refreshing history:', error);
      toast.error('Failed to refresh history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="My History">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My History</h1>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              View your activity history including checkouts, returns, and reservations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="activities" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
              </TabsList>

              <TabsContent value="activities" className="space-y-4">
                {/* Search and filters for activities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search activities..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by action" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action === 'all' ? 'All Actions' : action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Activity list */}
                <div className="border rounded-md">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                      <p>Loading your activities...</p>
                    </div>
                  ) : filteredActivities.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No activities found</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredActivities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-muted/50">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getActionBadgeColor(activity.action)}>
                                {activity.action}
                              </Badge>
                              <span className="font-medium">{activity.description}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTimestamp(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reservations" className="space-y-4">
                {/* Reservations list */}
                <div className="border rounded-md">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                      <p>Loading your reservations...</p>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No reservations found</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {reservations.map((reservation) => (
                        <div key={reservation.id} className="p-4 hover:bg-muted/50">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusBadgeColor(reservation.status)}>
                                  {reservation.status}
                                </Badge>
                                <Badge variant="outline">
                                  {reservation.item_type === 'book' ? 'Book' : 'Room'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatTimestamp(reservation.created_at)}
                              </div>
                            </div>
                            
                            <div className="font-medium">
                              {reservation.item_type === 'book' ? (
                                <>
                                  {reservation.title} {reservation.author && <span className="text-muted-foreground">by {reservation.author}</span>}
                                </>
                              ) : (
                                <>{reservation.room_name}</>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateRange(reservation.start_date, reservation.end_date)}
                            </div>
                            
                            {reservation.notes && (
                              <div className="text-sm mt-1">
                                <span className="font-medium">Notes:</span> {reservation.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserHistory;
