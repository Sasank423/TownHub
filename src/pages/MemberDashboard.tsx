
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ReservationCard } from '../components/ReservationCard';
import { Calendar } from '../components/Calendar';
import { useAuth } from '../contexts/AuthContext';
import { getUserReservations } from '../services/reservationService';
import { Book, Calendar as CalendarIcon, Bell, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Reservation } from '../types/models';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      if (user) {
        try {
          const data = await getUserReservations(user.id);
          setReservations(data);
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

  const activeReservations = reservations.filter(res => res.status === 'Approved');
  const pendingReservations = reservations.filter(res => res.status === 'Pending');

  return (
    <DashboardLayout title={`${t('dashboard.welcome')}, ${user?.name || t('common.member')}`} breadcrumbs={[{ label: t('dashboard.dashboard') }]}>
      <div className="space-y-8">
        {/* Status Summary */}
        <div className="bg-card dark:bg-card/95 rounded-lg shadow-sm border border-border p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="font-medium text-lg text-foreground">{t('dashboard.membershipStatus')}</h2>
              <div className="flex items-center mt-2">
                <div className={`h-3 w-3 rounded-full ${user?.role === 'member' ? 'bg-green-500 dark:bg-green-400' : 'bg-amber-500 dark:bg-amber-400'} mr-2`}></div>
                <span className="text-foreground/80">{t('dashboard.active')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button 
                  className="gap-2"
                  size="sm"
                >
                  {t('dashboard.browseBooks')} <Book size={16} />
                </Button>
              </Link>
              <Link to="/rooms">
                <Button 
                  className="gap-2"
                  size="sm"
                  variant="outline"
                >
                  {t('dashboard.reserveRoom')} <CalendarIcon size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Reservations */}
          <div className="bg-card dark:bg-card/95 rounded-lg shadow-sm border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center text-foreground">
                <Book className="mr-2 h-5 w-5 text-primary" />
                {t('dashboard.activeReservations')}
              </h2>
              <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeReservations.length}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary dark:border-primary/80"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeReservations.length > 0 ? (
                  activeReservations.map(reservation => (
                    <ReservationCard key={reservation.id} reservation={reservation} compact />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground/40 dark:text-muted-foreground/30" />
                    <h3 className="mt-2 text-foreground font-medium">{t('dashboard.noActiveReservations')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.browseCatalogPrompt')}</p>
                  </div>
                )}
              </div>
            )}

            {activeReservations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border text-right">
                <Link to="/active-reservations">
                  <Button variant="link" size="sm" className="gap-1">
                    {t('dashboard.viewAll')} <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Pending Approvals - FIXED DARK THEME STYLING */}
          <div className="bg-card dark:bg-card/95 rounded-lg shadow-sm border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center text-foreground">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                {t('dashboard.pendingApprovals')}
              </h2>
              {pendingReservations.length > 0 && (
                <span className="bg-amber-900/30 text-amber-300 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingReservations.length} {t('dashboard.pending')}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary dark:border-primary/80"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReservations.length > 0 ? (
                  pendingReservations.map(reservation => (
                    <ReservationCard key={reservation.id} reservation={reservation} compact />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/40 dark:text-muted-foreground/30" />
                    <h3 className="mt-2 text-foreground font-medium">No pending reservations</h3>
                    <p className="mt-1 text-sm text-muted-foreground">All your requests have been processed</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-border flex justify-end">
              {pendingReservations.length > 0 ? (
                <Link to="/pending-requests">
                  <Button variant="link" size="sm" className="gap-1">
                    {t('dashboard.viewAll')} <ArrowRight size={14} />
                  </Button>
                </Link>
              ) : (
                <div className="h-6"></div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Calendar reservations={reservations} />
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
