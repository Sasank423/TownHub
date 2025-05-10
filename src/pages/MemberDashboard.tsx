
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ReservationCard } from '../components/ReservationCard';
import { Calendar } from '../components/Calendar';
import { useAuth } from '../contexts/AuthContext';
import { getUserReservations } from '../utils/mockData';
import { Book, Calendar as CalendarIcon, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MemberDashboard = () => {
  const { user } = useAuth();
  const reservations = user ? getUserReservations(user.id) : [];

  const activeReservations = reservations.filter(res => res.status === 'Approved');
  const pendingReservations = reservations.filter(res => res.status === 'Pending');

  return (
    <DashboardLayout title={`Welcome, ${user?.name || 'Member'}`} breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        {/* Status Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Membership Status</h2>
              <div className="flex items-center mt-2">
                <div className={`h-3 w-3 rounded-full ${user?.membershipStatus === 'Active' ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
                <span className="text-gray-700">{user?.membershipStatus || 'Unknown'}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                className="gap-2"
                size="sm"
              >
                Browse Catalog <Book size={16} />
              </Button>
              <Button 
                className="gap-2"
                size="sm"
                variant="outline"
              >
                Reserve Room <CalendarIcon size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Reservations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <Book className="mr-2 h-5 w-5 text-primary" />
                Active Reservations
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeReservations.length}
              </span>
            </div>

            <div className="space-y-3">
              {activeReservations.length > 0 ? (
                activeReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} compact />
                ))
              ) : (
                <div className="text-center py-8">
                  <Book className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-gray-700 font-medium">No active reservations</h3>
                  <p className="mt-1 text-sm text-gray-500">Browse our catalog to find books</p>
                </div>
              )}
            </div>

            {activeReservations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                <Button variant="link" size="sm" className="gap-1">
                  View All <ArrowRight size={14} />
                </Button>
              </div>
            )}
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Pending Approvals
              </h2>
              {pendingReservations.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingReservations.length} pending
                </span>
              )}
            </div>

            <div className="space-y-3">
              {pendingReservations.length > 0 ? (
                pendingReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} compact />
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-gray-700 font-medium">No pending reservations</h3>
                  <p className="mt-1 text-sm text-gray-500">All your requests have been processed</p>
                </div>
              )}
            </div>

            {pendingReservations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                <Button variant="link" size="sm" className="gap-1">
                  View All <ArrowRight size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <Calendar reservations={reservations} />
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
