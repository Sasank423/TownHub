
import React from 'react';
import { Calendar as CalendarIcon, Book, Home } from 'lucide-react';
import { Reservation } from '../utils/mockData';
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface CalendarProps {
  reservations: Reservation[];
}

export const Calendar: React.FC<CalendarProps> = ({ reservations }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getReservationsForDay = (day: Date) => {
    return reservations.filter(res => {
      const startDate = new Date(res.startDate);
      const endDate = new Date(res.endDate);
      
      return (
        isSameDay(startDate, day) || 
        isSameDay(endDate, day) || 
        (day > startDate && day < endDate)
      );
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          Reservation Calendar
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <h3 className="py-2">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button 
            onClick={nextMonth}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div 
            key={day} 
            className="text-center text-sm py-2 font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the start of month */}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 border border-transparent"></div>
        ))}
        
        {daysInMonth.map((day, i) => {
          const dayReservations = getReservationsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={i}
              className={`h-24 border rounded-md p-1 ${
                isToday ? 'border-primary bg-primary/5' : 'border-gray-100'
              }`}
            >
              <div className="text-right mb-1">
                <span className={`text-sm ${isToday ? 'font-semibold text-primary' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1 overflow-hidden">
                {dayReservations.slice(0, 2).map((res, idx) => (
                  <div 
                    key={idx}
                    className={`text-xs px-1 py-0.5 rounded truncate flex items-center ${
                      res.itemType === 'book' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {res.itemType === 'book' ? (
                      <Book size={10} className="mr-1" />
                    ) : (
                      <Home size={10} className="mr-1" />
                    )}
                    <span className="truncate">{res.title}</span>
                  </div>
                ))}
                
                {dayReservations.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayReservations.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Empty cells for days after the end of month */}
        {Array.from({ length: 6 - endOfMonth(currentMonth).getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-24 border border-transparent"></div>
        ))}
      </div>
    </div>
  );
};
