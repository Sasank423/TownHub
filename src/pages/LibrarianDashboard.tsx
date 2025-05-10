
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { ActivityFeed } from '../components/ActivityFeed';
import { Book, Users, Calendar, Home, ArrowRight } from 'lucide-react';
import { getStatistics } from '../utils/mockData';
import { Button } from '@/components/ui/button';

const LibrarianDashboard = () => {
  const stats = getStatistics();
  
  return (
    <DashboardLayout title="Librarian Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Library Administration</h2>
              <p className="text-sm text-gray-500 mt-1">
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
            trend="up"
            trendValue="+3 since yesterday"
          />
        </div>

        {/* Approval Queue and Activity Feed */}
        <div className="grid md:grid-cols-2 gap-6">
          <ApprovalQueue />
          <ActivityFeed />
        </div>

        {/* System Status */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium mb-2">Available Books</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold">{stats.availableBooks}</span>
              <span className="text-sm text-gray-500 mb-1">of {stats.totalBooks}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${Math.round((stats.availableBooks / stats.totalBooks) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium mb-2">Room Utilization</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold">67%</span>
              <span className="text-sm text-green-600 mb-1">↑ 5%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-purple-500 rounded-full"
                style={{ width: '67%' }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium mb-2">Overdue Items</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold">{stats.overdueItems}</span>
              <span className="text-sm text-red-600 mb-1">Items</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-red-500 rounded-full"
                style={{ width: `${Math.round((stats.overdueItems / stats.activeReservations) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
