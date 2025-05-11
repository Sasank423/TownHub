
import React from 'react';
import { Book, Calendar, Home, CheckCircle } from 'lucide-react';
import { Reservation } from '../types/models';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface ReservationCardProps {
  reservation: Reservation;
  compact?: boolean;
  onComplete?: (reservation: Reservation) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, compact = false, onComplete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Declined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString.includes('T')) {
      return format(new Date(dateString), 'MMM d, h:mm a');
    }
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${reservation.itemType === 'book' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
            {reservation.itemType === 'book' ? (
              <Book className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            ) : (
              <Home className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{reservation.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {reservation.itemType === 'book' ? 'Book' : 'Room'} Reservation
            </p>
          </div>
        </div>
        <div className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${getStatusColor(reservation.status)}`}>
          {reservation.status}
        </div>
      </div>
      
      {!compact && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
            <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            {reservation.itemType === 'book' ? (
              <span>
                From {formatDate(reservation.startDate)} to {formatDate(reservation.endDate)}
              </span>
            ) : (
              <span>
                {formatDate(reservation.startDate)}
              </span>
            )}
          </div>
          
          {/* Complete button for data collection */}
          {onComplete && reservation.status === 'Approved' && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onComplete(reservation);
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
