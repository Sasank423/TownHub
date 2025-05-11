import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Bell, Book, Home, Calendar, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserReservations } from '../services/reservationService';
import { Reservation } from '../types/models';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const PendingRequests = () => {
  const { user } = useAuth();
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      if (user) {
        try {
          const data = await getUserReservations(user.id);
          // Filter to only include pending reservations
          const pendingOnly = data.filter(res => res.status === 'Pending');
          setPendingReservations(pendingOnly);
          setFilteredReservations(pendingOnly);
        } catch (error) {
          console.error("Error fetching reservations:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReservations(pendingReservations);
    } else {
      const filtered = pendingReservations.filter(res => 
        res.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReservations(filtered);
    }
  }, [searchQuery, pendingReservations]);

  const formatDate = (dateString: string) => {
    if (dateString.includes('T')) {
      return format(new Date(dateString), 'MMM d, h:mm a');
    }
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getItemTypeIcon = (type: string) => {
    if (type === 'book') {
      return <Book className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    } else {
      return <Home className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
    }
  };

  return (
    <DashboardLayout 
      title="Pending Requests" 
      breadcrumbs={[
        { label: 'Dashboard', path: '/member' },
        { label: 'Pending Requests' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-lg font-medium text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            <span>Pending Approval Requests</span>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary dark:border-primary/80"></div>
          </div>
        ) : (
          <div className="bg-card dark:bg-card/95 rounded-lg shadow-sm border border-border overflow-hidden">
            {filteredReservations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div className={`p-2 rounded-lg inline-flex ${reservation.itemType === 'book' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                            {getItemTypeIcon(reservation.itemType)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{reservation.title}</TableCell>
                        <TableCell>{formatDate(reservation.createdAt || reservation.startDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30">
                            Pending
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/40 dark:text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No pending requests</h3>
                <p className="mt-2 text-muted-foreground">
                  You don't have any pending approval requests at the moment.
                </p>
                <Button className="mt-4" size="sm">
                  Browse Catalog
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingRequests;
