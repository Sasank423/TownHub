
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { ActivityFeed } from '../components/ActivityFeed';
import { ReservationHistory } from '../components/ReservationHistory';
import { Book, Users, Calendar, Home, ArrowRight, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/custom-tabs';
import { supabase } from '../integrations/supabase/client';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalRooms: 0,
    activeReservations: 0,
    availableBooks: 0,
    pendingApprovals: 0,
    overdueItems: 0,
    roomUtilization: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get total books count
        const { count: totalBooks, error: booksError } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true });
          
        if (booksError) throw booksError;
        
        // Get total rooms count
        const { count: totalRooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true });
          
        if (roomsError) throw roomsError;
        
        // Get active reservations count
        const { count: activeReservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .in('status', ['Approved', 'Pending']);
          
        if (reservationsError) throw reservationsError;
        
        // Get available books count
        const { count: availableBooks, error: availableBooksError } = await supabase
          .from('book_copies')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available');
          
        if (availableBooksError) throw availableBooksError;
        
        // Get pending approvals count
        const { count: pendingApprovals, error: pendingApprovalsError } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending');
          
        if (pendingApprovalsError) throw pendingApprovalsError;

        // Get overdue items count
        const today = new Date().toISOString();
        const { count: overdueItems, error: overdueItemsError } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Approved')
          .lt('end_date', today);
          
        if (overdueItemsError) throw overdueItemsError;
        
        // Calculate room utilization (as a percentage)
        // This is a simplified calculation, in a real app this might be more complex
        const roomUtilization = totalRooms > 0 ? 
          Math.round((await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('item_type', 'room')
            .eq('status', 'Approved')
            .gte('end_date', today)
            .then(({ count }) => count || 0) / totalRooms) * 100) : 0;
        
        setStats({
          totalBooks: totalBooks || 0,
          totalRooms: totalRooms || 0,
          activeReservations: activeReservations || 0,
          availableBooks: availableBooks || 0,
          pendingApprovals: pendingApprovals || 0,
          overdueItems: overdueItems || 0,
          roomUtilization
        });
        
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    // Set up a refresh interval for stats (every 5 minutes)
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <DashboardLayout title="Librarian Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="font-medium text-lg dark:text-white">Library Administration</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage library resources and member requests
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" size="sm">
                <Book size={16} /> Manage Catalog
              </Button>
              <Button className="gap-2" size="sm" variant="outline">
                <Calendar size={16} /> Room Schedule
              </Button>
              <Button className="gap-2" size="sm" variant="outline">
                <Users size={16} /> Member Management
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 h-32 animate-pulse">
                <div className="p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-3"></div>
                  <div className="h-7 w-16 bg-gray-300 dark:bg-slate-600 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Books"
              value={stats.totalBooks}
              icon={Book}
              color="blue"
              description="Library collection"
            />
            <StatCard 
              title="Total Rooms"
              value={stats.totalRooms}
              icon={Home}
              color="purple"
              description="Available for reservations"
            />
            <StatCard 
              title="Active Reservations"
              value={stats.activeReservations}
              icon={Calendar}
              color="green"
              description="Books and rooms"
            />
            <StatCard 
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={Calendar}
              color="amber"
              description="Requiring attention"
              trend={stats.pendingApprovals > 0 ? "up" : undefined}
              trendValue={stats.pendingApprovals > 0 ? `${stats.pendingApprovals} pending` : undefined}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="approvals">
          <TabsList className="mb-6">
            <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
            <TabsTrigger value="history">Reservation History</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="approvals">
            <ApprovalQueue />
          </TabsContent>
          
          <TabsContent value="history">
            <ReservationHistory />
          </TabsContent>
          
          <TabsContent value="activity">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center dark:text-white">
                  <Clock className="mr-2 h-5 w-5 text-primary dark:text-primary" />
                  Recent Activity
                </h2>
              </div>
              <ActivityFeed />
            </div>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 h-32 animate-pulse">
                <div className="p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-3"></div>
                  <div className="h-6 w-16 bg-gray-300 dark:bg-slate-600 rounded mb-2"></div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-medium mb-2 dark:text-white">Available Books</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold dark:text-white">{stats.availableBooks}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">of {stats.totalBooks}</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${Math.round((stats.availableBooks / stats.totalBooks) * 100) || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-medium mb-2 dark:text-white">Room Utilization</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold dark:text-white">{stats.roomUtilization}%</span>
                <span className="text-sm text-green-600 dark:text-green-400 mb-1">Occupancy</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                <div 
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${stats.roomUtilization}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-medium mb-2 dark:text-white">Overdue Items</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold dark:text-white">{stats.overdueItems}</span>
                <span className="text-sm text-red-600 dark:text-red-400 mb-1">Items</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                <div 
                  className="h-2 bg-red-500 rounded-full"
                  style={{ width: `${stats.activeReservations > 0 ? Math.round((stats.overdueItems / stats.activeReservations) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
