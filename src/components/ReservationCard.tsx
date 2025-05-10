
import React from 'react';
import { Book, Calendar, Home } from 'lucide-react';
import { Reservation } from '../utils/mockData';
import { format } from 'date-fns';

interface ReservationCardProps {
  reservation: Reservation;
  compact?: boolean;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, compact = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Declined': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString.includes('T')) {
      return format(new Date(dateString), 'MMM d, h:mm a');
    }
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${reservation.itemType === 'book' ? 'bg-blue-50' : 'bg-purple-50'}`}>
            {reservation.itemType === 'book' ? (
              <Book className="h-5 w-5 text-blue-500" />
            ) : (
              <Home className="h-5 w-5 text-purple-500" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{reservation.title}</h3>
            <p className="text-sm text-gray-500">
              {reservation.itemType === 'book' ? 'Book' : 'Room'} Reservation
            </p>
          </div>
        </div>
        <div className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${getStatusColor(reservation.status)}`}>
          {reservation.status}
        </div>
      </div>
      
      {!compact && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
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
        </div>
      )}
    </div>
  );
};
