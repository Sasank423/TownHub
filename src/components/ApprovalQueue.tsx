
import React from 'react';
import { CheckCircle, Book, Home, Clock, X } from 'lucide-react';
import { mockPendingReservations } from '../utils/mockData';
import { format } from 'date-fns';

export const ApprovalQueue: React.FC = () => {
  const [pendingReservations, setPendingReservations] = React.useState(mockPendingReservations);

  const handleApprove = (id: string) => {
    setPendingReservations(prev => prev.filter(res => res.id !== id));
  };
  
  const handleDecline = (id: string) => {
    setPendingReservations(prev => prev.filter(res => res.id !== id));
  };

  const formatDate = (dateString: string) => {
    if (dateString.includes('T')) {
      return format(new Date(dateString), 'MMM d, h:mm a');
    }
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-primary" />
          Pending Approvals
        </h2>
        {pendingReservations.length > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {pendingReservations.length} pending
          </span>
        )}
      </div>

      {pendingReservations.length === 0 ? (
        <div className="text-center py-10">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReservations.map(reservation => (
            <div 
              key={reservation.id} 
              className="border border-gray-100 rounded-lg p-4"
            >
              <div className="flex justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${reservation.itemType === 'book' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                    {reservation.itemType === 'book' ? (
                      <Book className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Home className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{reservation.title}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {formatDate(reservation.startDate)}
                        {reservation.itemType === 'book' && ` - ${formatDate(reservation.endDate)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleDecline(reservation.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Decline"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleApprove(reservation.id)}
                    className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                    aria-label="Approve"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
